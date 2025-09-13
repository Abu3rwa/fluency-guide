import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
} from '@mui/material';
import {
  Book as BookIcon,
  Quiz as QuizIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useUser } from '../../../../contexts/UserContext';
import { 
  checkLessonTaskCompletion, 
  processLessonVocabulary 
} from '../../../../services/student-services/lessonCompletionMonitoring';

const StudentVocabularyWidget = ({ 
  vocabularyStats = {}, 
  reviewQueue = [], 
  loading = false,
  onStartReview,
  onViewVocabulary,
  // New props for lesson integration
  currentLessonId = null,
  currentLessonTitle = "Current Lesson",
  showLessonIntegration = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userData: user } = useUser();
  
  // State for lesson integration
  const [lessonData, setLessonData] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState(null);

  // Check lesson progress when lesson ID changes
  const checkLessonProgress = useCallback(async () => {
    if (!user?.uid || !currentLessonId || !showLessonIntegration) return;
    
    setLessonLoading(true);
    setLessonError(null);
    
    try {
      const [taskCompletion, vocabularyResult] = await Promise.all([
        checkLessonTaskCompletion(user.uid, currentLessonId),
        processLessonVocabulary(currentLessonId, user.uid)
      ]);
      
      setLessonData({ taskCompletion, vocabularyResult });
    } catch (err) {
      console.error('Error checking lesson progress:', err);
      setLessonError(err.message);
    } finally {
      setLessonLoading(false);
    }
  }, [user?.uid, currentLessonId, showLessonIntegration]);

  // Auto-check lesson progress
  useEffect(() => {
    if (showLessonIntegration && currentLessonId) {
      checkLessonProgress();
    }
  }, [checkLessonProgress, showLessonIntegration, currentLessonId]);

  const {
    totalWords = 0,
    masteredWords = 0,
    todayWords = 0,
    streakDays = 0,
  } = vocabularyStats;

  const masteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
  const reviewCount = reviewQueue.length || 0;

  if (loading) {
    return (
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.vocabulary.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('student.dashboard.loading.vocabulary')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookIcon color="primary" />
            {t('student.dashboard.vocabulary.title')}
          </Typography>
          {reviewCount > 0 && (
            <Chip
              label={`${reviewCount} ${t('student.dashboard.vocabulary.dueForReview')}`}
              color="warning"
              size="small"
              variant="filled"
            />
          )}
        </Box>

        {/* Vocabulary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {totalWords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('student.dashboard.vocabulary.totalWords')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {masteredWords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('student.dashboard.vocabulary.mastered')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                {todayWords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('student.dashboard.vocabulary.todayWords')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600 }}>
                {streakDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('student.dashboard.vocabulary.streakDays')}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Mastery Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" />
              {t('student.dashboard.vocabulary.masteryProgress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {masteryPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={masteryPercentage}
            color="success"
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<QuizIcon />}
              onClick={onStartReview}
              disabled={reviewCount === 0}
              sx={{
                py: 1.5,
                borderRadius: 2,
              }}
            >
              {reviewCount > 0
                ? `${t('student.dashboard.vocabulary.startReview')} (${reviewCount})`
                : t('student.dashboard.vocabulary.noReviewNeeded')
              }
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<BookIcon />}
              onClick={onViewVocabulary}
              sx={{
                py: 1.5,
                borderRadius: 2,
              }}
            >
              {t('student.dashboard.vocabulary.viewAll')}
            </Button>
          </Grid>
        </Grid>

        {/* Quick Stats */}
        {totalWords > 0 && (
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: `1px solid ${theme.palette.grey[200]}`,
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('student.dashboard.vocabulary.weeklyGoal')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.min(todayWords * 7, 50)} {t('student.dashboard.vocabulary.words')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('student.dashboard.vocabulary.accuracy')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('student.dashboard.vocabulary.nextReview')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {reviewCount > 0 ? t('student.dashboard.vocabulary.now') : t('student.dashboard.vocabulary.tomorrow')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Lesson Integration Section */}
        {showLessonIntegration && currentLessonId && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TaskIcon fontSize="small" />
                {currentLessonTitle}
              </Typography>
              
              {lessonLoading && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('student.dashboard.lessonCompletion.checking')}
                  </Typography>
                </Box>
              )}
              
              {lessonError && (
                <Alert severity="error" size="small" sx={{ mt: 1 }}>
                  {lessonError}
                </Alert>
              )}
              
              {lessonData && (
                <Box sx={{ mt: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {lessonData.taskCompletion.tasksRequired}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('student.dashboard.lessonCompletion.totalTasks')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {lessonData.taskCompletion.tasksPassed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('student.dashboard.lessonCompletion.passed')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="secondary.main">
                          {lessonData.vocabularyResult.wordsFound?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('student.dashboard.vocabulary.wordsProcessed')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {lessonData.taskCompletion.isComplete ? (
                    <Chip 
                      label={t('student.dashboard.lessonCompletion.completed')} 
                      color="success" 
                      size="small" 
                      icon={<CheckCircleIcon />}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Chip 
                      label={`${lessonData.taskCompletion.tasksPassed}/${lessonData.taskCompletion.tasksRequired} ${t('student.dashboard.lessonCompletion.tasksPassed')}`}
                      color="warning" 
                      size="small" 
                      icon={<WarningIcon />}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentVocabularyWidget;