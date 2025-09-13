import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Task as TaskIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useUser } from '../../../../contexts/UserContext';
import { 
  checkLessonTaskCompletion, 
  completeLessonWithValidation,
  processLessonVocabulary 
} from '../../../../services/student-services/lessonCompletionMonitoring';

const StudentLessonVocabularyIntegration = ({ 
  lessonId, 
  lessonTitle = "Current Lesson",
  onLessonComplete,
  onVocabularyUpdate,
  compact = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userData: user } = useUser();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [completionData, setCompletionData] = useState(null);
  const [vocabularyData, setVocabularyData] = useState(null);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);

  // Check lesson completion status
  const checkCompletion = async () => {
    if (!user?.uid || !lessonId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const taskCompletion = await checkLessonTaskCompletion(user.uid, lessonId);
      const vocabularyResult = await processLessonVocabulary(lessonId, user.uid);
      
      setCompletionData(taskCompletion);
      setVocabularyData(vocabularyResult);
      
      if (onVocabularyUpdate && vocabularyResult.wordsFound?.length > 0) {
        onVocabularyUpdate(vocabularyResult);
      }
    } catch (err) {
      console.error('Error checking lesson completion:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Complete lesson
  const handleCompleteLesson = async () => {
    if (!user?.uid || !lessonId) return;
    
    setCompleting(true);
    setError(null);
    
    try {
      const result = await completeLessonWithValidation(user.uid, lessonId);
      
      if (result.success) {
        setCompletionData(result.taskCompletion);
        setVocabularyData(result.vocabularyProcessing);
        
        if (onLessonComplete) {
          onLessonComplete(result);
        }
        
        if (onVocabularyUpdate && result.vocabularyProcessing?.wordsFound?.length > 0) {
          onVocabularyUpdate(result.vocabularyProcessing);
        }
      } else {
        setError(result.message || 'Failed to complete lesson');
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  // Auto-check on mount and lesson change
  useEffect(() => {
    if (lessonId && user?.uid) {
      checkCompletion();
    }
  }, [lessonId, user?.uid]);

  // Render loading state
  if (loading && !completionData) {
    return (
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('student.dashboard.lessonCompletion.checking')}
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={checkCompletion}>
                {t('common.retry')}
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no completion data
  if (!completionData) {
    return null;
  }

  const { isComplete, tasksCompleted, tasksRequired, tasksPassed, completionPercentage } = completionData;
  const vocabularyCount = vocabularyData?.wordsFound?.length || 0;
  const vocabularyNotFound = vocabularyData?.wordsNotFound?.length || 0;

  return (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 3,
        border: isComplete ? `2px solid ${theme.palette.success.main}` : undefined,
        backgroundColor: isComplete ? theme.palette.success.light + '10' : undefined
      }}
    >
      <CardContent>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: expanded ? 2 : 0
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flex: 1
            }}
          >
            {isComplete ? (
              <CheckCircleIcon color="success" />
            ) : (
              <TaskIcon color={tasksCompleted > 0 ? 'warning' : 'action'} />
            )}
            {lessonTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Completion Status Chip */}
            <Chip
              label={
                isComplete 
                  ? t('student.dashboard.lessonCompletion.completed')
                  : `${tasksPassed}/${tasksRequired} ${t('student.dashboard.lessonCompletion.tasksPassed')}`
              }
              color={isComplete ? 'success' : tasksCompleted > 0 ? 'warning' : 'default'}
              size="small"
            />
            
            {/* Expand/Collapse Button */}
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              size="small"
              aria-label={expanded ? t('common.collapse') : t('common.expand')}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          {/* Progress Overview */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('student.dashboard.lessonCompletion.progress')}: {completionPercentage}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              color={isComplete ? 'success' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Task Details Grid */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary">
                  {tasksRequired}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.dashboard.lessonCompletion.totalTasks')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main">
                  {tasksCompleted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.dashboard.lessonCompletion.attempted')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="success.main">
                  {tasksPassed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.dashboard.lessonCompletion.passed')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="secondary.main">
                  {vocabularyCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.dashboard.vocabulary.wordsProcessed')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Vocabulary Summary */}
          {vocabularyData && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookIcon fontSize="small" />
                {t('student.dashboard.vocabulary.lessonVocabulary')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {vocabularyCount > 0 && (
                  <Chip 
                    label={`${vocabularyCount} ${t('student.dashboard.vocabulary.wordsFound')}`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
                {vocabularyNotFound > 0 && (
                  <Chip 
                    label={`${vocabularyNotFound} ${t('student.dashboard.vocabulary.wordsNotFound')}`}
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!isComplete && (
              <Button
                variant="contained"
                color={tasksCompleted === tasksRequired ? 'success' : 'primary'}
                disabled={completing || tasksCompleted < tasksRequired}
                onClick={handleCompleteLesson}
                startIcon={completing ? undefined : <PlayArrowIcon />}
                sx={{ minWidth: 140 }}
              >
                {completing 
                  ? t('student.dashboard.lessonCompletion.completing')
                  : t('student.dashboard.lessonCompletion.completeLesson')
                }
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={checkCompletion}
              disabled={loading}
              size="small"
            >
              {t('student.dashboard.lessonCompletion.refresh')}
            </Button>
            
            {vocabularyCount > 0 && (
              <Button
                variant="outlined"
                href="/student/vocabulary"
                startIcon={<BookIcon />}
                size="small"
              >
                {t('student.dashboard.vocabulary.viewVocabulary')}
              </Button>
            )}
          </Box>

          {/* Requirements not met warning */}
          {!isComplete && tasksCompleted > 0 && tasksPassed < tasksRequired && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('student.dashboard.lessonCompletion.requirementsNotMet', {
                  passed: tasksPassed,
                  required: tasksRequired
                })}
              </Typography>
            </Alert>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default StudentLessonVocabularyIntegration;