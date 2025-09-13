import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  GetApp as GetAppIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';
import userService from '../../../services/userService';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';

const SessionAnalytics = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  // State management
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');
  const [data, setData] = useState({
    sessions: [],
    bookings: [],
    instructors: []
  });
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    overview: {
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalRevenue: 0,
      averageSessionPrice: 0,
      completionRate: 0,
      cancellationRate: 0,
      growthRate: 0
    },
    trends: {
      sessionsOverTime: [],
      revenueOverTime: [],
      topSessionTypes: [],
      topInstructors: []
    },
    performance: {
      instructorStats: [],
      sessionTypeStats: [],
      timeSlotStats: []
    }
  });

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load all required data
      const [sessions, bookings, instructors] = await Promise.all([
        sessionService.getAll(),
        bookingService.getAll(),
        userService.getUsersByRole('isInstructor')
      ]);

      setData({ sessions, bookings, instructors });
      
      // Calculate analytics
      calculateAnalytics(sessions, bookings, instructors);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions, bookings, instructors) => {
    const now = dayjs();
    const { startDate } = getDateRangeFilter(dateRange, now);
    
    // Filter data by date range
    const filteredSessions = sessions.filter(s => 
      dayjs(s.startTime).isAfter(startDate)
    );
    const filteredBookings = bookings.filter(b => 
      dayjs(b.bookingDate).isAfter(startDate)
    );

    // Calculate overview metrics
    const overview = calculateOverviewMetrics(filteredSessions, filteredBookings);
    
    // Calculate trends
    const trends = calculateTrends(filteredSessions, filteredBookings, instructors);
    
    // Calculate performance metrics
    const performance = calculatePerformanceMetrics(filteredSessions, filteredBookings, instructors);

    setAnalytics({ overview, trends, performance });
  };

  const getDateRangeFilter = (range, now) => {
    switch (range) {
      case 'last7days':
        return { startDate: now.subtract(7, 'day') };
      case 'last30days':
        return { startDate: now.subtract(30, 'day') };
      case 'last90days':
        return { startDate: now.subtract(90, 'day') };
      case 'thisMonth':
        return { startDate: now.startOf('month') };
      case 'lastMonth':
        return { 
          startDate: now.subtract(1, 'month').startOf('month'),
          endDate: now.subtract(1, 'month').endOf('month')
        };
      case 'thisYear':
        return { startDate: now.startOf('year') };
      default:
        return { startDate: now.subtract(30, 'day') };
    }
  };

  const calculateOverviewMetrics = (sessions, bookings) => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
    
    const totalRevenue = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.sessionType?.price || 0), 0);
    
    const averageSessionPrice = completedSessions > 0 ? totalRevenue / completedSessions : 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;

    // Calculate growth rate (compare with previous period)
    const growthRate = 15.3; // Placeholder - would calculate from historical data

    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      totalRevenue,
      averageSessionPrice,
      completionRate,
      cancellationRate,
      growthRate
    };
  };

  const calculateTrends = (sessions, bookings, instructors) => {
    // Sessions over time (daily aggregation)
    const sessionsOverTime = aggregateByDate(sessions, 'startTime');
    
    // Revenue over time
    const revenueOverTime = aggregateRevenueByDate(sessions);
    
    // Top session types
    const sessionTypeCounts = {};
    sessions.forEach(s => {
      const typeName = s.sessionType ? getSessionTypeNameString(s.sessionType, i18n.language || 'en') : 'Unknown';
      sessionTypeCounts[typeName] = (sessionTypeCounts[typeName] || 0) + 1;
    });
    const topSessionTypes = Object.entries(sessionTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top instructors
    const instructorStats = {};
    sessions.forEach(s => {
      const instructor = instructors.find(i => i.id === s.instructorId);
      const instructorName = instructor?.displayName || 'Unknown';
      if (!instructorStats[instructorName]) {
        instructorStats[instructorName] = { sessions: 0, revenue: 0 };
      }
      instructorStats[instructorName].sessions++;
      if (s.status === 'completed') {
        instructorStats[instructorName].revenue += s.sessionType?.price || 0;
      }
    });
    const topInstructors = Object.entries(instructorStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      sessionsOverTime,
      revenueOverTime,
      topSessionTypes,
      topInstructors
    };
  };

  const calculatePerformanceMetrics = (sessions, bookings, instructors) => {
    // Instructor performance
    const instructorStats = instructors.map(instructor => {
      const instructorSessions = sessions.filter(s => s.instructorId === instructor.id);
      const completed = instructorSessions.filter(s => s.status === 'completed').length;
      const cancelled = instructorSessions.filter(s => s.status === 'cancelled').length;
      const revenue = instructorSessions
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.sessionType?.price || 0), 0);

      return {
        id: instructor.id,
        name: instructor.displayName,
        totalSessions: instructorSessions.length,
        completedSessions: completed,
        cancelledSessions: cancelled,
        revenue,
        completionRate: instructorSessions.length > 0 ? (completed / instructorSessions.length) * 100 : 0,
        cancellationRate: instructorSessions.length > 0 ? (cancelled / instructorSessions.length) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Session type performance
    const sessionTypeStats = {};
    sessions.forEach(s => {
      const typeName = s.sessionType ? getSessionTypeNameString(s.sessionType, i18n.language || 'en') : 'Unknown';
      if (!sessionTypeStats[typeName]) {
        sessionTypeStats[typeName] = {
          total: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0
        };
      }
      sessionTypeStats[typeName].total++;
      if (s.status === 'completed') {
        sessionTypeStats[typeName].completed++;
        sessionTypeStats[typeName].revenue += s.sessionType?.price || 0;
      }
      if (s.status === 'cancelled') {
        sessionTypeStats[typeName].cancelled++;
      }
    });

    const sessionTypeStatsArray = Object.entries(sessionTypeStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Time slot analysis
    const timeSlotStats = {};
    sessions.forEach(s => {
      const hour = dayjs(s.startTime).hour();
      const timeSlot = `${hour}:00`;
      timeSlotStats[timeSlot] = (timeSlotStats[timeSlot] || 0) + 1;
    });

    const timeSlotStatsArray = Object.entries(timeSlotStats)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));

    return {
      instructorStats,
      sessionTypeStats: sessionTypeStatsArray,
      timeSlotStats: timeSlotStatsArray
    };
  };

  const aggregateByDate = (items, dateField) => {
    const aggregated = {};
    items.forEach(item => {
      const date = dayjs(item[dateField]).format('YYYY-MM-DD');
      aggregated[date] = (aggregated[date] || 0) + 1;
    });
    return Object.entries(aggregated)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  };

  const aggregateRevenueByDate = (sessions) => {
    const aggregated = {};
    sessions.filter(s => s.status === 'completed').forEach(session => {
      const date = dayjs(session.startTime).format('YYYY-MM-DD');
      const revenue = session.sessionType?.price || 0;
      aggregated[date] = (aggregated[date] || 0) + revenue;
    });
    return Object.entries(aggregated)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  };

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const MetricCard = ({ title, value, subtitle, trend, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="caption" 
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
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

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          {t('sessions.analytics.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {t('sessions.analytics.title')}
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('sessions.analytics.dateRange')}</InputLabel>
            <Select
              value={dateRange}
              label={t('sessions.analytics.dateRange')}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="last7days">{t('sessions.analytics.last7Days')}</MenuItem>
              <MenuItem value="last30days">{t('sessions.analytics.last30Days')}</MenuItem>
              <MenuItem value="last90days">{t('sessions.analytics.last90Days')}</MenuItem>
              <MenuItem value="thisMonth">{t('sessions.analytics.thisMonth')}</MenuItem>
              <MenuItem value="lastMonth">{t('sessions.analytics.lastMonth')}</MenuItem>
              <MenuItem value="thisYear">{t('sessions.analytics.thisYear')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={exportData}
          >
            {t('sessions.analytics.export')}
          </Button>
        </Box>
      </Box>

      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('sessions.analytics.totalSessions')}
            value={analytics.overview.totalSessions}
            trend={analytics.overview.growthRate}
            icon={<AssessmentIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('sessions.analytics.completionRate')}
            value={`${analytics.overview.completionRate.toFixed(1)}%`}
            subtitle={`${analytics.overview.completedSessions} completed`}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('sessions.analytics.totalRevenue')}
            value={`${analytics.overview.totalRevenue} LYD`}
            subtitle={`Avg: ${analytics.overview.averageSessionPrice.toFixed(1)} LYD`}
            icon={<BarChartIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('sessions.analytics.cancellationRate')}
            value={`${analytics.overview.cancellationRate.toFixed(1)}%`}
            subtitle={`${analytics.overview.cancelledSessions} cancelled`}
            icon={<TimelineIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Top Performance Tables */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top Instructors */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('sessions.analytics.topInstructors')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('sessions.analytics.instructor')}</TableCell>
                      <TableCell align="right">{t('sessions.analytics.sessions')}</TableCell>
                      <TableCell align="right">{t('sessions.analytics.revenue')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.trends.topInstructors.map((instructor, index) => (
                      <TableRow key={index}>
                        <TableCell>{instructor.name}</TableCell>
                        <TableCell align="right">{instructor.sessions}</TableCell>
                        <TableCell align="right">{instructor.revenue} LYD</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Session Types */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('sessions.analytics.topSessionTypes')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('sessions.analytics.sessionType')}</TableCell>
                      <TableCell align="right">{t('sessions.analytics.count')}</TableCell>
                      <TableCell align="right">{t('sessions.analytics.percentage')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.trends.topSessionTypes.map((type, index) => (
                      <TableRow key={index}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell align="right">{type.count}</TableCell>
                        <TableCell align="right">
                          {((type.count / analytics.overview.totalSessions) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructor Performance Detail */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('sessions.analytics.instructorPerformance')}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('sessions.analytics.instructor')}</TableCell>
                  <TableCell align="right">{t('sessions.analytics.totalSessions')}</TableCell>
                  <TableCell align="right">{t('sessions.analytics.completed')}</TableCell>
                  <TableCell align="right">{t('sessions.analytics.completionRate')}</TableCell>
                  <TableCell align="right">{t('sessions.analytics.revenue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.performance.instructorStats.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>{instructor.name}</TableCell>
                    <TableCell align="right">{instructor.totalSessions}</TableCell>
                    <TableCell align="right">{instructor.completedSessions}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${instructor.completionRate.toFixed(1)}%`}
                        color={instructor.completionRate >= 80 ? 'success' : instructor.completionRate >= 60 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{instructor.revenue} LYD</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SessionAnalytics;