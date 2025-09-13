import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Timer as TimerIcon,
  Book as BookIcon,
  RecordVoiceOver as VoiceIcon,
} from '@mui/icons-material';

const StudentProgressOverview = ({ todayStats = {}, goals = [], loading = false }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isRTL = i18n.language === 'ar';
  const isDark = theme.palette.mode === 'dark';

  const {
    studyTime = 0,
    lessonsCompleted = 0,
    vocabularyWords = 0,
    pronunciationPractice = 0,
  } = todayStats;

  // Memoized theme-aware colors
  const getProgressCardStyles = useMemo(() => ({
    light: {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
      boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.04)}`,
    },
    dark: {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`,
    }
  }), [theme]);

  const progressCardStyles = isDark ? getProgressCardStyles.dark : getProgressCardStyles.light;

  const formatStudyTime = (minutes) => {
    if (minutes < 60) return `${minutes}${t('student.dashboard.progress.minutes')}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}${t('student.dashboard.progress.hours')} ${remainingMinutes}${t('student.dashboard.progress.minutes')}` 
      : `${hours}${t('student.dashboard.progress.hours')}`;
  };

  // Enhanced progress items with better accessibility and theming
  const progressItems = useMemo(() => [
    {
      icon: <TimerIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: t('student.dashboard.progress.studyTime'),
      value: formatStudyTime(studyTime),
      progress: Math.min((studyTime / 60) * 100, 100), // 60 min daily goal
      color: 'primary',
      target: 60,
      unit: t('student.dashboard.progress.minutes'),
      ariaLabel: `${t('student.dashboard.progress.studyTime')}: ${formatStudyTime(studyTime)}`,
    },
    {
      icon: <SchoolIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: t('student.dashboard.progress.lessonsCompleted'),
      value: lessonsCompleted,
      progress: Math.min((lessonsCompleted / 3) * 100, 100), // 3 lessons daily goal
      color: 'secondary',
      target: 3,
      unit: t('student.dashboard.progress.lessons'),
      ariaLabel: `${t('student.dashboard.progress.lessonsCompleted')}: ${lessonsCompleted}`,
    },
    {
      icon: <BookIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: t('student.dashboard.progress.vocabularyWords'),
      value: vocabularyWords,
      progress: Math.min((vocabularyWords / 10) * 100, 100), // 10 words daily goal
      color: 'success',
      target: 10,
      unit: t('student.dashboard.progress.words'),
      ariaLabel: `${t('student.dashboard.progress.vocabularyWords')}: ${vocabularyWords}`,
    },
    {
      icon: <VoiceIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: t('student.dashboard.progress.pronunciationPractice'),
      value: pronunciationPractice,
      progress: Math.min((pronunciationPractice / 5) * 100, 100), // 5 practice daily goal
      color: 'warning',
      target: 5,
      unit: t('student.dashboard.progress.exercises'),
      ariaLabel: `${t('student.dashboard.progress.pronunciationPractice')}: ${pronunciationPractice}`,
    },
  ], [studyTime, lessonsCompleted, vocabularyWords, pronunciationPractice, t, formatStudyTime]);

  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3);

  if (loading) {
    return (
      <Card 
        elevation={isDark ? 4 : 2} 
        sx={{ 
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          border: isDark ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom color="text.primary">
            {t('student.dashboard.progress.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('student.dashboard.loading.progress')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={isDark ? 4 : 2} 
      sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: isDark ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            mb: 3,
            color: theme.palette.text.primary,
            fontWeight: 600,
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {t('student.dashboard.progress.title')}
        </Typography>

        {/* Today's Progress */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ 
              mb: 2,
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('student.dashboard.progress.todayProgress')}
          </Typography>
          <Grid container spacing={2}>
            {progressItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  role="region"
                  aria-label={item.ariaLabel}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    ...progressCardStyles,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark 
                        ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}` 
                        : `0 4px 8px ${alpha(theme.palette.common.black, 0.08)}`,
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette[item.color].main, 
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1,
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography 
                    variant={isMobile ? 'h6' : 'h5'} 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {item.value}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    color={item.color}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark 
                        ? alpha(theme.palette[item.color].main, 0.1)
                        : alpha(theme.palette[item.color].main, 0.08),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: theme.palette[item.color].main,
                      },
                    }}
                    aria-label={`Progress: ${Math.round(item.progress)}%`}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5,
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  >
                    {Math.round(item.progress)}% {t('student.dashboard.progress.completed')}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <Box>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                mb: 2,
                color: theme.palette.text.secondary,
                fontWeight: 500,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('student.dashboard.progress.activeGoals')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
              {activeGoals.map((goal, index) => (
                <Chip
                  key={index}
                  label={goal.title}
                  variant={isDark ? 'filled' : 'outlined'}
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}`,
                    '& .MuiChip-label': {
                      px: 2,
                      fontSize: '0.75rem',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProgressOverview;