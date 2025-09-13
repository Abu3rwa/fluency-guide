import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  EmojiEvents as AchievementIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

const StudentRecentActivities = ({ 
  activities = [], 
  loading = false,
  onActivityClick,
  onViewAll,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_completed':
        return <SchoolIcon />;
      case 'vocabulary_practice':
        return <BookIcon />;
      case 'quiz_completed':
        return <QuizIcon />;
      case 'achievement_unlocked':
        return <AchievementIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lesson_completed':
        return 'primary';
      case 'vocabulary_practice':
        return 'success';
      case 'quiz_completed':
        return 'warning';
      case 'achievement_unlocked':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ${t('student.dashboard.activities.ago')}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ${t('student.dashboard.activities.ago')}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${t('student.dashboard.activities.ago')}`;
  };

  const getProgressChip = (activity) => {
    if (activity.progress !== undefined && activity.progress < 100) {
      return (
        <Chip
          label={`${Math.round(activity.progress)}%`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    return null;
  };

  const handleActivityClick = (activity) => {
    // Smart navigation: if activity is incomplete, continue it
    if (activity.progress && activity.progress < 100) {
      onActivityClick && onActivityClick(activity, 'continue');
    } else {
      onActivityClick && onActivityClick(activity, 'view');
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.activities.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('student.dashboard.loading.activities')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.activities.title')}
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 4,
              textAlign: 'center',
            }}
          >
            <TimeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('student.dashboard.activities.noActivities')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('student.dashboard.activities.startLearning')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('student.dashboard.activities.title')}
          </Typography>
          {activities.length > 5 && (
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={onViewAll}
            >
              {t('student.dashboard.activities.viewAll')}
            </Button>
          )}
        </Box>

        <List sx={{ p: 0 }}>
          {activities.slice(0, 5).map((activity, index) => (
            <ListItem
              key={activity.id || index}
              sx={{
                border: `1px solid ${theme.palette.grey[200]}`,
                borderRadius: 2,
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                  transform: 'translateX(4px)',
                },
                '&:last-child': {
                  mb: 0,
                },
              }}
              onClick={() => handleActivityClick(activity)}
            >
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: theme.palette[getActivityColor(activity.type)]?.main || theme.palette.primary.main,
                    width: 40,
                    height: 40,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {activity.title || activity.description}
                    </Typography>
                    {getProgressChip(activity)}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.courseName && `${activity.courseName} • `}
                      {formatTimeAgo(activity.timestamp || activity.createdAt)}
                    </Typography>
                    {activity.points && (
                      <Typography variant="caption" color="primary">
                        +{activity.points} {t('student.dashboard.activities.points')}
                      </Typography>
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivityClick(activity);
                  }}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    width: 32,
                    height: 32,
                  }}
                >
                  <PlayIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {activities.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
            >
              {t('student.dashboard.activities.showMore')} ({activities.length - 5})
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRecentActivities;