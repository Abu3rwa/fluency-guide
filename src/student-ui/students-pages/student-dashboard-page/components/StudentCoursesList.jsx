import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';

const StudentCoursesList = ({ 
  enrolledCourses = [], 
  onCourseClick, 
  loading = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.courses.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('student.dashboard.loading.courses')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.courses.title')}
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
            <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('student.dashboard.courses.noCourses')}
            </Typography>
            <Button variant="contained" color="primary">
              {t('student.dashboard.courses.browseCourses')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'primary';
  };

  const getStatusChip = (course) => {
    const progress = course.progress || 0;
    if (progress >= 100) {
      return (
        <Chip
          icon={<CompleteIcon />}
          label={t('student.dashboard.courses.completed')}
          color="success"
          size="small"
          variant="filled"
        />
      );
    }
    if (progress > 0) {
      return (
        <Chip
          label={t('student.dashboard.courses.inProgress')}
          color="primary"
          size="small"
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        label={t('student.dashboard.courses.notStarted')}
        color="default"
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {t('student.dashboard.courses.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {enrolledCourses.length} {t('student.dashboard.courses.enrolled')}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {enrolledCourses.slice(0, isMobile ? 2 : 4).map((course, index) => {
            const progress = course.progress || 0;
            return (
              <Grid item xs={12} sm={6} md={6} lg={3} key={course.id || index}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.grey[200]}`,
                    backgroundColor: theme.palette.background.paper,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onCourseClick && onCourseClick(course)}
                >
                  {/* Course Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={course.thumbnail || course.image}
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {course.title || course.name}
                      </Typography>
                      {getStatusChip(course)}
                    </Box>
                  </Box>

                  {/* Course Description */}
                  {course.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        height: '2.8em',
                      }}
                    >
                      {course.description}
                    </Typography>
                  )}

                  {/* Progress */}
                  <Box sx={{ mb: 2, mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('student.dashboard.courses.progress')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={getProgressColor(progress)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                      }}
                    />
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant={progress > 0 ? 'outlined' : 'contained'}
                    color="primary"
                    startIcon={<PlayIcon />}
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCourseClick && onCourseClick(course);
                    }}
                  >
                    {progress >= 100
                      ? t('student.dashboard.courses.review')
                      : progress > 0
                      ? t('student.dashboard.courses.continue')
                      : t('student.dashboard.courses.start')
                    }
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* View All Button */}
        {enrolledCourses.length > (isMobile ? 2 : 4) && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined" color="primary">
              {t('student.dashboard.courses.viewAll')} ({enrolledCourses.length})
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCoursesList;