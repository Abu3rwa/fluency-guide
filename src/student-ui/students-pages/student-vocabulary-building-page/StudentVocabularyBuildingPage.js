import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import { useVocabularyWords } from "../../../contexts/vocabularyWordsContext";
import { useVocabularyProgress } from "../../../contexts/vocabularyProgressContext";
import { useVocabularyGoals } from "../../../contexts/vocabularyGoalsContext";
import StudentVocabularyAppBar from "./components/StudentVocabularyAppBar";
import StudentVocabularyGoalSection from "./components/StudentVocabularyGoalSection";
import StudentVocabularyProgressSection from "./components/StudentVocabularyProgressSection";
import StudentVocabularyWordCard from "./components/StudentVocabularyWordCard";
import StudentVocabularyNavigationControls from "./components/StudentVocabularyNavigationControls";
import StudentGoalCompletedDialog from "./components/dialogs/StudentGoalCompletedDialog";
import StudentMotivationDialog from "./components/dialogs/StudentMotivationDialog";
import StudentPronunciationDialog from "./components/dialogs/StudentPronunciationDialog";
import { useStudyTimer } from "../../../hooks/useStudyTimer";
import StudyMotivationDialog from "../../../components/StudyMotivationDialog";
import VocabularyErrorBoundary from "../../../shared/components/VocabularyErrorBoundary";
import VocabularyReviewIntegration from "../../../shared/components/VocabularyReviewIntegration";
import { useTranslation } from "react-i18next";
import StudentLessonVocabularyIntegration from "./components/StudentLessonVocabularyIntegration";

const StudentVocabularyBuildingPage = React.memo(({ lessonId, lessonTitle, showLessonIntegration = false }) => {
  useStudyTimer();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  // Use split contexts
  const {
    vocabularyWords,
    currentWord,
    currentWordIndex,
    navigationState,
    fetchVocabularyWords,
    goToNextWord,
    goToPreviousWord,
    goToFirstWord,
    goToLastWord,
    setRandomWord,
    loading: wordsLoading,
    error: wordsError,
  } = useVocabularyWords();

  const {
    getWordProgress,
    markWordAsLearned,
    markWordAsDifficult,
    toggleFavorite,
    loading: progressLoading,
    error: progressError,
  } = useVocabularyProgress();

  const {
    activeGoal,
    goalCompleted,
    updateGoalProgress,
    loading: goalsLoading,
    error: goalsError,
  } = useVocabularyGoals();

  // State for search and favorites
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for dialogs
  const [showGoalCompletedDialog, setShowGoalCompletedDialog] = useState(false);
  const [showMotivationDialog, setShowMotivationDialog] = useState(false);
  const [showPronunciationDialog, setShowPronunciationDialog] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  // State for lesson integration
  const [showLessonSection, setShowLessonSection] = useState(showLessonIntegration);
  const [lessonVocabularyData, setLessonVocabularyData] = useState(null);

  // Combined loading and error states
  const loading = useMemo(
    () => ({
      words: wordsLoading.words,
      progress: progressLoading.progress,
      goals: goalsLoading.goals,
      vocabulary:
        wordsLoading.words || progressLoading.progress || goalsLoading.goals,
      review: false, // Will be handled by VocabularyReviewIntegration
    }),
    [wordsLoading, progressLoading, goalsLoading]
  );

  const error = useMemo(
    () => ({
      words: wordsError.words,
      progress: progressError.progress,
      goals: goalsError.goals,
    }),
    [wordsError, progressError, goalsError]
  );

  // Handle word actions with goal integration
  const handleMarkAsLearned = useCallback(
    async (wordId) => {
      try {
        await markWordAsLearned(wordId);

        // Update goal progress
        if (activeGoal) {
          const goalCompleted = await updateGoalProgress(1);
          if (goalCompleted) {
            setShowGoalCompletedDialog(true);
          } else {
            // Show motivation dialog occasionally
            if (Math.random() < 0.3) {
              setShowMotivationDialog(true);
            }
          }
        }
      } catch (error) {
        console.error("Error marking word as learned:", error);
        // Show user-friendly error message
        // You could add a toast notification here
      }
    },
    [markWordAsLearned, activeGoal, updateGoalProgress]
  );

  const handleMarkAsDifficult = useCallback(
    async (wordId) => {
      try {
        await markWordAsDifficult(wordId);
      } catch (error) {
        console.error("Error marking word as difficult:", error);
        // Show user-friendly error message
        // You could add a toast notification here
      }
    },
    [markWordAsDifficult]
  );

  const handleToggleFavorite = useCallback(
    async (wordId) => {
      try {
        await toggleFavorite(wordId);
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // Show user-friendly error message
        // You could add a toast notification here
      }
    },
    [toggleFavorite]
  );

  const handlePronunciationClick = useCallback((word) => {
    setSelectedWord(word);
    setShowPronunciationDialog(true);
  }, []);

  // Search and filter handlers
  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      fetchVocabularyWords({
        searchTerm: term,
        favoritesOnly: showFavoritesOnly,
      });
    },
    [fetchVocabularyWords, showFavoritesOnly]
  );

  const handleToggleFavorites = useCallback(() => {
    const newShowFavorites = !showFavoritesOnly;
    setShowFavoritesOnly(newShowFavorites);
    fetchVocabularyWords({
      favoritesOnly: newShowFavorites,
      searchTerm,
    });
  }, [fetchVocabularyWords, searchTerm, showFavoritesOnly]);

  // Dialog handlers
  const handleCloseGoalCompletedDialog = useCallback(() => {
    setShowGoalCompletedDialog(false);
  }, []);

  const handleCloseMotivationDialog = useCallback(() => {
    setShowMotivationDialog(false);
  }, []);

  const handleClosePronunciationDialog = useCallback(() => {
    setShowPronunciationDialog(false);
  }, []);

  // Lesson integration handlers
  const handleLessonVocabularyUpdate = useCallback((vocabularyData) => {
    setLessonVocabularyData(vocabularyData);
    // Refresh vocabulary context if lesson vocabulary was processed
    if (vocabularyData.wordsFound?.length > 0) {
      fetchVocabularyWords({ forceRefresh: true });
    }
  }, [fetchVocabularyWords]);

  const handleLessonComplete = useCallback((result) => {
    if (result.success) {
      // Show success message or update UI as needed
      console.log('Lesson completed successfully:', result);
      // Refresh vocabulary data
      fetchVocabularyWords({ forceRefresh: true });
    }
  }, [fetchVocabularyWords]);

  const toggleLessonSection = useCallback(() => {
    setShowLessonSection(!showLessonSection);
  }, [showLessonSection]);


  // Initial data loading
  useEffect(() => {
    if (currentUser?.uid) {
      fetchVocabularyWords();
    }
  }, [currentUser?.uid, fetchVocabularyWords]);

  // Sync vocabulary progress with review system
  useEffect(() => {
    if (vocabularyWords.length > 0 && currentUser?.uid) {
      // This ensures that vocabulary progress is synced with the review system
      // The VocabularyReviewIntegration component will handle the review queue updates
      console.log(
        "📚 Vocabulary words loaded, review system will sync automatically"
      );
    }
  }, [vocabularyWords.length, currentUser?.uid]);

  // Show loading state
  if (loading.words && vocabularyWords.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error.words && vocabularyWords.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchVocabularyWords()}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="h6">{t("vocabulary.error.title")}</Typography>
          <Typography>{error.words}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <VocabularyErrorBoundary>
      <Box
        sx={{ minHeight: "100vh", bgcolor: "background.default", marginTop: 3 }}
      >
        <StudentVocabularyAppBar
          onSearch={handleSearch}
          onToggleFavorites={handleToggleFavorites}
          showFavoritesOnly={showFavoritesOnly}
          isSearchExpanded={isSearchExpanded}
          setIsSearchExpanded={setIsSearchExpanded}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Lesson Integration Section */}
          {(showLessonIntegration && lessonId) && (
            <Box sx={{ mb: 4 }}>
              <StudentLessonVocabularyIntegration
                lessonId={lessonId}
                lessonTitle={lessonTitle}
                showLessonCompletion={true}
                showVocabularyWords={false} // We'll handle vocabulary display below
                onLessonComplete={handleLessonComplete}
                onVocabularyUpdate={handleLessonVocabularyUpdate}
                compact={false}
              />
            </Box>
          )}
          {currentWord ? (
            <Box
              sx={{
                mt: 4,
                transition: "all 0.3s ease-in-out",
                opacity: loading.vocabulary ? 0.6 : 1,
              }}
            >
              <StudentVocabularyWordCard
                word={currentWord}
                onMarkAsLearned={() => handleMarkAsLearned(currentWord.id)}
                onMarkAsDifficult={() => handleMarkAsDifficult(currentWord.id)}
                onToggleFavorite={() => handleToggleFavorite(currentWord.id)}
                onPronunciationClick={() =>
                  handlePronunciationClick(currentWord)
                }
              />

              <StudentVocabularyNavigationControls
                currentIndex={currentWordIndex}
                totalWords={navigationState.totalWords}
                onNext={goToNextWord}
                onPrevious={goToPreviousWord}
                onRandom={setRandomWord}
                onFirst={goToFirstWord}
                onLast={goToLastWord}
                canGoNext={navigationState.canGoNext}
                canGoPrevious={navigationState.canGoPrevious}
              />
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="40vh"
            >
              <Typography variant="h6" color="text.secondary">
                {t("vocabulary.noWords")}
              </Typography>
            </Box>
          )}
          {/* Goal Section */}
          <StudentVocabularyGoalSection />

          {/* Progress Section */}
          <StudentVocabularyProgressSection />

          {/* Lesson Vocabulary Summary */}
          {lessonVocabularyData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('student.dashboard.vocabulary.lessonVocabulary')}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {t('student.dashboard.vocabulary.wordsFound', { 
                    count: lessonVocabularyData.wordsFound?.length || 0 
                  })}
                  {lessonVocabularyData.wordsNotFound?.length > 0 && (
                    <span>
                      {' • '}
                      {t('student.dashboard.vocabulary.wordsNotFound', { 
                        count: lessonVocabularyData.wordsNotFound.length 
                      })}
                    </span>
                  )}
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Personalized Review Integration */}
          <VocabularyReviewIntegration />

          {/* Main Content */}
        </Container>

        {/* Dialogs */}
        <StudentGoalCompletedDialog
          open={showGoalCompletedDialog}
          onClose={handleCloseGoalCompletedDialog}
          goal={activeGoal}
        />

        <StudentMotivationDialog
          open={showMotivationDialog}
          onClose={handleCloseMotivationDialog}
        />

        <StudentPronunciationDialog
          open={showPronunciationDialog}
          onClose={handleClosePronunciationDialog}
          word={selectedWord}
        />
        <StudyMotivationDialog />
      </Box>
    </VocabularyErrorBoundary>
  );
});

StudentVocabularyBuildingPage.displayName = "StudentVocabularyBuildingPage";

export default StudentVocabularyBuildingPage;
