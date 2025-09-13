import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Book as BookIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';
import { useVocabularyWords } from '../../../../contexts/vocabularyWordsContext';
import { useVocabularyProgress } from '../../../../contexts/vocabularyProgressContext';
import { 
  checkLessonTaskCompletion, 
  processLessonVocabulary,
  completeLessonWithValidation 
} from '../../../../services/student-services/lessonCompletionMonitoring';
import StudentVocabularyWordCard from './StudentVocabularyWordCard';
import StudentVocabularyNavigationControls from './StudentVocabularyNavigationControls';

/**
 * Enhanced vocabulary component that integrates lesson completion monitoring
 * with the existing comprehensive vocabulary building system
 */
const StudentLessonVocabularyIntegration = ({ 
  lessonId, 
  lessonTitle = "Current Lesson",
  showLessonCompletion = true,
  showVocabularyWords = true,
  compact = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  
  // Existing vocabulary context hooks
  const {
    vocabularyWords,
    currentWord,
    currentWordIndex,
    fetchVocabularyWords,
    goToNextWord,
    goToPreviousWord,
    setRandomWord,
    loading: wordsLoading,
    error: wordsError,
  } = useVocabularyWords();

  const {
    markWordAsLearned,
    markWordAsDifficult,
    toggleFavorite,
    loading: progressLoading,
  } = useVocabularyProgress();

  // State for lesson completion integration
  const [completionData, setCompletionData] = useState(null);
  const [vocabularyData, setVocabularyData] = useState(null);
  const [lessonError, setLessonError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  // Tab state for switching between all vocabulary and lesson vocabulary
  const [currentTab, setCurrentTab] = useState(0);
  const [lessonVocabularyWords, setLessonVocabularyWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);

  // Check lesson completion and process vocabulary
  const checkLessonProgress = useCallback(async () => {
    if (!currentUser?.uid || !lessonId) return;
    
    setLoading(true);
    setLessonError(null);
    
    try {
      const [taskCompletion, vocabularyResult] = await Promise.all([
        checkLessonTaskCompletion(currentUser.uid, lessonId),
        processLessonVocabulary(lessonId, currentUser.uid)
      ]);
      
      setCompletionData(taskCompletion);
      setVocabularyData(vocabularyResult);
      
      // Extract lesson vocabulary words and match with vocabulary context
      if (vocabularyResult.wordsFound?.length > 0) {
        const lessonWordIds = vocabularyResult.wordsFound.map(w => w.id);
        const matchedWords = vocabularyWords.filter(word => 
          lessonWordIds.includes(word.id)
        );
        setLessonVocabularyWords(matchedWords);
      }
    } catch (err) {
      console.error('Error checking lesson progress:', err);
      setLessonError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, lessonId, vocabularyWords]);

  // Complete lesson
  const handleCompleteLesson = useCallback(async () => {
    if (!currentUser?.uid || !lessonId) return;
    
    setCompleting(true);
    setLessonError(null);
    
    try {
      const result = await completeLessonWithValidation(currentUser.uid, lessonId);
      
      if (result.success) {
        setCompletionData(result.taskCompletion);
        setVocabularyData(result.vocabularyProcessing);
        
        // Refresh vocabulary data after lesson completion
        await fetchVocabularyWords();
      } else {
        setLessonError(result.message || 'Failed to complete lesson');
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      setLessonError(err.message);
    } finally {
      setCompleting(false);
    }
  }, [currentUser?.uid, lessonId, fetchVocabularyWords]);

  // Handle vocabulary actions with lesson integration
  const handleMarkAsLearned = useCallback(async (wordId) => {
    try {
      await markWordAsLearned(wordId);
      // Refresh lesson progress if this was a lesson vocabulary word
      if (lessonVocabularyWords.some(w => w.id === wordId)) {
        checkLessonProgress();
      }
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  }, [markWordAsLearned, lessonVocabularyWords, checkLessonProgress]);

  const handleMarkAsDifficult = useCallback(async (wordId) => {
    try {
      await markWordAsDifficult(wordId);
    } catch (error) {
      console.error('Error marking word as difficult:', error);
    }
  }, [markWordAsDifficult]);

  const handleToggleFavorite = useCallback(async (wordId) => {
    try {
      await toggleFavorite(wordId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [toggleFavorite]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Update filtered words based on current tab
  useEffect(() => {
    if (currentTab === 0) {
      // All vocabulary words
      setFilteredWords(vocabularyWords);
    } else {
      // Lesson vocabulary only
      setFilteredWords(lessonVocabularyWords);
    }
  }, [currentTab, vocabularyWords, lessonVocabularyWords]);

  // Auto-check lesson progress on mount and lesson change
  useEffect(() => {
    if (lessonId && currentUser?.uid) {
      checkLessonProgress();
    }
  }, [lessonId, currentUser?.uid, checkLessonProgress]);

  // Calculate lesson completion statistics
  const lessonStats = useMemo(() => {
    if (!completionData || !vocabularyData) return null;
    
    return {
      tasksCompleted: completionData.tasksCompleted,
      tasksRequired: completionData.tasksRequired,
      tasksPassed: completionData.tasksPassed,
      completionPercentage: completionData.completionPercentage,
      vocabularyCount: vocabularyData.wordsFound?.length || 0,
      vocabularyNotFound: vocabularyData.wordsNotFound?.length || 0,
      isComplete: completionData.isComplete
    };
  }, [completionData, vocabularyData]);

  // Render lesson completion section
  const renderLessonCompletion = () => {
    if (!showLessonCompletion || !lessonStats) return null;

    const { tasksCompleted, tasksRequired, tasksPassed, completionPercentage, vocabularyCount, isComplete } = lessonStats;

    return (
      <Box sx={{ mb: 3 }}>
        <Card 
          elevation={2}
          sx={{ 
            border: isComplete ? `2px solid ${theme.palette.success.main}` : undefined,
            backgroundColor: isComplete ? theme.palette.success.light + '10' : undefined
          }}
        >
          <CardContent>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isComplete ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <TaskIcon color={tasksCompleted > 0 ? 'warning' : 'action'} />
                )}
                {lessonTitle}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={
                    isComplete 
                      ? t('student.dashboard.lessonCompletion.completed')
                      : `${tasksPassed}/${tasksRequired} ${t('student.dashboard.lessonCompletion.tasksPassed')}`
                  }
                  color={isComplete ? 'success' : tasksCompleted > 0 ? 'warning' : 'default'}
                  size="small"
                />
                
                <IconButton 
                  onClick={() => setExpanded(!expanded)}
                  size="small"
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expanded}>
              {/* Progress Stats */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography variant="h6" color="primary">
                    {tasksRequired}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('student.dashboard.lessonCompletion.totalTasks')}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography variant="h6" color="success.main">
                    {tasksPassed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('student.dashboard.lessonCompletion.passed')}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography variant="h6" color="secondary.main">
                    {vocabularyCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('student.dashboard.vocabulary.wordsProcessed')}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {!isComplete && (
                  <Button
                    variant="contained"
                    color={tasksCompleted === tasksRequired ? 'success' : 'primary'}
                    disabled={completing || tasksCompleted < tasksRequired}
                    onClick={handleCompleteLesson}
                    size="small"
                  >
                    {completing 
                      ? t('student.dashboard.lessonCompletion.completing')
                      : t('student.dashboard.lessonCompletion.completeLesson')
                    }
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  onClick={checkLessonProgress}
                  disabled={loading}
                  size="small"
                  startIcon={<RefreshIcon />}
                >
                  {t('student.dashboard.lessonCompletion.refresh')}
                </Button>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Render vocabulary tabs
  const renderVocabularyTabs = () => {
    if (!showVocabularyWords) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab 
            label={
              <Badge badgeContent={vocabularyWords.length} color="primary" max={999}>
                {t('vocabulary.title')}
              </Badge>
            }
            icon={<SchoolIcon />}
            iconPosition="start"
          />
          {lessonVocabularyWords.length > 0 && (
            <Tab 
              label={
                <Badge badgeContent={lessonVocabularyWords.length} color="secondary" max={999}>
                  {t('student.dashboard.vocabulary.lessonVocabulary')}
                </Badge>
              }
              icon={<BookIcon />}
              iconPosition="start"
            />
          )}
        </Tabs>
      </Box>
    );
  };

  // Render vocabulary content
  const renderVocabularyContent = () => {
    if (!showVocabularyWords) return null;

    const wordsToShow = filteredWords;
    const currentWordToShow = currentTab === 0 ? currentWord : 
      (lessonVocabularyWords.length > 0 ? lessonVocabularyWords[0] : null);

    if (wordsLoading.words) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>{t('vocabulary.loading')}</Typography>
        </Box>
      );
    }

    if (wordsError.words) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {wordsError.words}
        </Alert>
      );
    }

    if (!currentWordToShow) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          {currentTab === 0 
            ? t('vocabulary.noWords') 
            : t('student.dashboard.vocabulary.noLessonVocabulary')
          }
        </Alert>
      );
    }

    return (
      <Box>
        {/* Current Word Card */}
        <StudentVocabularyWordCard
          word={currentWordToShow}
          onMarkAsLearned={handleMarkAsLearned}
          onMarkAsDifficult={handleMarkAsDifficult}
          onToggleFavorite={handleToggleFavorite}
          onNavigateNext={goToNextWord}
          onNavigatePrevious={goToPreviousWord}
        />

        {/* Navigation Controls */}
        <StudentVocabularyNavigationControls
          currentIndex={currentWordIndex}
          totalWords={wordsToShow.length}
          onNext={goToNextWord}
          onPrevious={goToPreviousWord}
          onRandom={setRandomWord}
          disabled={progressLoading.progress}
        />
      </Box>
    );
  };

  // Handle errors
  if (lessonError) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={checkLessonProgress}>
            {t('common.retry')}
          </Button>
        }
        sx={{ mb: 2 }}
      >
        {lessonError}
      </Alert>
    );
  }

  return (
    <Box>
      {renderLessonCompletion()}
      {renderVocabularyTabs()}
      {renderVocabularyContent()}
    </Box>
  );
};

export default StudentLessonVocabularyIntegration;