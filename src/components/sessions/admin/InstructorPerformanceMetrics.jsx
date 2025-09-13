import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Rating,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// Import services
import { sessionService } from '../../../services/sessionService';
import { bookingService } from '../../../services/bookingService';
import userService from '../../../services/userService';
import { getSessionTypeNameString } from '../../../utils/sessionLocalization';

const InstructorPerformanceMetrics = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  // State management
  const [instructors, setInstructors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [timeRange, setTimeRange] = useState('last30days');

  // Load data on component mount
  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Load instructors and sessions
      const [allInstructors, allSessions] = await Promise.all([
        userService.getUsersByRole('isInstructor'),
        sessionService.getAll()
      ]);

      setInstructors(allInstructors || []);
      setSessions(allSessions || []);

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInstructorMetrics = (instructorId) => {
    const instructorSessions = sessions.filter(s => s.instructorId === instructorId);
    const now = dayjs();
    const startDate = getDateRangeStart(timeRange, now);
    const filteredSessions = instructorSessions.filter(s => 
      dayjs(s.startTime).isAfter(startDate)
    );

    const totalSessions = filteredSessions.length;
    const completedSessions = filteredSessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = filteredSessions.filter(s => s.status === 'cancelled').length;
    const upcomingSessions = filteredSessions.filter(s => 
      s.status === 'scheduled' && dayjs(s.startTime).isAfter(now)
    ).length;

    const revenue = filteredSessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.sessionType?.price || 0), 0);

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;
    
    // Calculate average rating (mock data for now)
    const averageRating = 4.2 + Math.random() * 0.8; // Mock rating between 4.2-5.0
    const totalRatings = Math.floor(Math.random() * 50) + 10; // Mock rating count

    // Calculate punctuality (mock data)
    const punctualityRate = 85 + Math.random() * 15; // Mock punctuality 85-100%

    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      upcomingSessions,
      revenue,
      completionRate,
      cancellationRate,
      averageRating,
      totalRatings,
      punctualityRate
    };
  };

  const getDateRangeStart = (range, now) => {
    switch (range) {
      case 'last7days': return now.subtract(7, 'day');
      case 'last30days': return now.subtract(30, 'day');
      case 'last90days': return now.subtract(90, 'day');
      case 'thisMonth': return now.startOf('month');
      case 'thisYear': return now.startOf('year');
      default: return now.subtract(30, 'day');
    }
  };

  const getPerformanceStatus = (metrics) => {
    if (metrics.completionRate >= 90 && metrics.averageRating >= 4.5) {
      return { status: 'excellent', color: 'success' };
    } else if (metrics.completionRate >= 80 && metrics.averageRating >= 4.0) {
      return { status: 'good', color: 'info' };
    } else if (metrics.completionRate >= 70 && metrics.averageRating >= 3.5) {
      return { status: 'fair', color: 'warning' };
    } else {
      return { status: 'needsImprovement', color: 'error' };
    }
  };

  const handleViewDetails = (instructor) => {
    setSelectedInstructor(instructor);
    setDetailsDialog(true);
  };

  const handleAddRating = (instructor) => {
    setSelectedInstructor(instructor);
    setRatingDialog(true);
  };

  const submitRating = async () => {
    try {
      // In a real implementation, this would save to the database
      console.log('Submitting rating:', {
        instructorId: selectedInstructor.id,
        rating: newRating,
        comment: ratingComment
      });
      
      setRatingDialog(false);
      setNewRating(5);
      setRatingComment('');
      
      // Reload data to reflect changes
      await loadPerformanceData();
      
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const InstructorCard = ({ instructor }) => {
    const metrics = calculateInstructorMetrics(instructor.id);
    const performance = getPerformanceStatus(metrics);
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar 
              src={instructor.profileImage} 
              sx={{ width: 60, height: 60 }}
            >
              {instructor.displayName[0]?.toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6">
                {instructor.displayName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Rating 
                  value={metrics.averageRating} 
                  precision={0.1} 
                  size="small" 
                  readOnly 
                />
                <Typography variant="caption" color="textSecondary">
                  ({metrics.totalRatings})
                </Typography>
              </Box>
              <Chip 
                label={t(`sessions.performance.status.${performance.status}`)}
                color={performance.color}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {metrics.totalSessions}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('sessions.performance.totalSessions')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {metrics.revenue} LYD
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('sessions.performance.revenue')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2">
                {t('sessions.performance.completionRate')}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {metrics.completionRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={metrics.completionRate} 
              color={metrics.completionRate >= 80 ? 'success' : metrics.completionRate >= 60 ? 'warning' : 'error'}
            />
          </Box>

          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewDetails(instructor)}
              fullWidth
            >
              {t('sessions.performance.viewDetails')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<StarIcon />}
              onClick={() => handleAddRating(instructor)}
              fullWidth
            >
              {t('sessions.performance.rate')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const InstructorDetailsDialog = () => {
    if (!selectedInstructor) return null;
    
    const metrics = calculateInstructorMetrics(selectedInstructor.id);
    const instructorSessions = sessions.filter(s => s.instructorId === selectedInstructor.id);
    
    return (
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={selectedInstructor.profileImage}>
              {selectedInstructor.displayName[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedInstructor.displayName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Rating value={metrics.averageRating} precision={0.1} size="small" readOnly />
                <Typography variant="caption">
                  ({metrics.totalRatings} {t('sessions.performance.ratings')})
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('sessions.performance.performanceMetrics')}
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('sessions.performance.totalSessions')}
                    secondary={metrics.totalSessions}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('sessions.performance.completionRate')}
                    secondary={`${metrics.completionRate.toFixed(1)}%`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <MoneyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('sessions.performance.revenue')}
                    secondary={`${metrics.revenue} LYD`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <AssessmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('sessions.performance.punctuality')}
                    secondary={`${metrics.punctualityRate.toFixed(1)}%`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            {/* Recent Sessions */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('sessions.performance.recentSessions')}
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('sessions.performance.date')}</TableCell>
                      <TableCell>{t('sessions.performance.type')}</TableCell>
                      <TableCell>{t('sessions.performance.status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instructorSessions.slice(0, 5).map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {dayjs(session.startTime).format('MMM DD')}
                        </TableCell>
                        <TableCell>
                          {session.sessionType ? getSessionTypeNameString(session.sessionType, i18n.language || 'en') : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(`sessions.status.${session.status}`)}
                            size="small"
                            color={session.status === 'completed' ? 'success' : 
                                   session.status === 'cancelled' ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const RatingDialog = () => (
    <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('sessions.performance.rateInstructor')}
      </DialogTitle>
      
      <DialogContent>
        {selectedInstructor && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar src={selectedInstructor.profileImage}>
                {selectedInstructor.displayName[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6">
                {selectedInstructor.displayName}
              </Typography>
            </Box>
            
            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                {t('sessions.performance.rating')}
              </Typography>
              <Rating
                value={newRating}
                onChange={(event, newValue) => setNewRating(newValue)}
                size="large"
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('sessions.performance.comment')}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t('sessions.performance.commentPlaceholder')}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setRatingDialog(false)}>
          {t('common.cancel')}
        </Button>
        <Button onClick={submitRating} variant="contained">
          {t('sessions.performance.submitRating')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('sessions.performance.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {t('sessions.performance.title')}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('sessions.performance.timeRange')}</InputLabel>
          <Select
            value={timeRange}
            label={t('sessions.performance.timeRange')}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="last7days">{t('sessions.performance.last7Days')}</MenuItem>
            <MenuItem value="last30days">{t('sessions.performance.last30Days')}</MenuItem>
            <MenuItem value="last90days">{t('sessions.performance.last90Days')}</MenuItem>
            <MenuItem value="thisMonth">{t('sessions.performance.thisMonth')}</MenuItem>
            <MenuItem value="thisYear">{t('sessions.performance.thisYear')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Instructor Performance Cards */}
      <Grid container spacing={3}>
        {instructors.map((instructor) => (
          <Grid item xs={12} sm={6} md={4} key={instructor.id}>
            <InstructorCard instructor={instructor} />
          </Grid>
        ))}
      </Grid>

      {instructors.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            {t('sessions.performance.noInstructors')}
          </Typography>
        </Box>
      )}

      {/* Dialogs */}
      <InstructorDetailsDialog />
      <RatingDialog />
    </Box>
  );
};

export default InstructorPerformanceMetrics;