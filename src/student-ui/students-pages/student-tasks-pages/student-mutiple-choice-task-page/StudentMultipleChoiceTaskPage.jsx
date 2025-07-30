import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import StudentTaskLayout from "../components/StudentTaskLayout";
import StudentTaskResultsPage from "../components/StudentTaskResultsPage";
import { useMultipleChoiceQuiz } from "./hooks/useMultipleChoiceQuiz";
import {
  ResumeDialog,
  InstructionsAlert,
  KeyboardShortcuts,
  ScreenReaderAnnouncements,
  NotificationSnackbar,
  LoadingState,
  QuizContent,
} from "./components";

const MultipleChoiceTaskPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Mobile and accessibility support
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Debug logging
  console.log("MultipleChoiceTaskPage - isMobile:", isMobile);
  console.log("MultipleChoiceTaskPage - isSmallScreen:", isSmallScreen);

  // Custom hook for all quiz logic
  const {
    // State
    task,
    loading,
    error,
    currentQuestionIndex,
    showFeedback,
    isCurrentCorrect,
    secondsRemaining,
    quizCompleted,
    score,
    totalPoints,
    isPaused,
    showResumeDialog,
    savedProgress,
    resumeDialogHandled,
    showInstructions,
    notification,
    retryCount,
    isOnline,
    currentQuestion,
    selectedAnswer,
    isCurrentAnswered,
    isLastQuestion,

    // Actions
    setShowInstructions,
    hideNotification,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleResumeQuiz,
    handleStartOver,
    togglePause,
    handleRestart,
  } = useMultipleChoiceQuiz();

  // Debug logging for state
  console.log("MultipleChoiceTaskPage - loading:", loading);
  console.log("MultipleChoiceTaskPage - error:", error);
  console.log("MultipleChoiceTaskPage - task:", task);

  // Handle resume dialog close
  const handleResumeDialogClose = () => {
    if (!resumeDialogHandled) {
      setShowInstructions(false);
    }
  };

  // Show loading or error state
  if (loading || error) {
    console.log("MultipleChoiceTaskPage - showing LoadingState");
    return (
      <LoadingState loading={loading} error={error} retryCount={retryCount} />
    );
  }
  // Show results if completed
  if (quizCompleted) {
    console.log("MultipleChoiceTaskPage - showing StudentTaskResultsPage");
    return (
      <StudentTaskResultsPage
        score={score}
        totalPoints={totalPoints}
        task={task}
        onRestart={handleRestart}
      />
    );
  }

  console.log("MultipleChoiceTaskPage - rendering main content");

  return (
    <>
      {/* Resume Dialog */}
      <ResumeDialog
        open={showResumeDialog}
        onClose={handleResumeDialogClose}
        onResume={handleResumeQuiz}
        onStartOver={handleStartOver}
      />

      <StudentTaskLayout
        task={task}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={task?.questions?.length || 0}
        timeRemaining={secondsRemaining}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        isAnswered={isCurrentAnswered}
        isLastQuestion={isLastQuestion}
        onPause={togglePause}
        isPaused={isPaused}
      >
        <QuizContent
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          showFeedback={showFeedback}
          isCurrentCorrect={isCurrentCorrect}
          disabled={showFeedback}
          isMobile={isMobile}
          isSmallScreen={isSmallScreen}
        />
      </StudentTaskLayout>

      {/* Instructions Alert */}
      <InstructionsAlert
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Keyboard Shortcuts (desktop only) */}
      {!isMobile && (
        <KeyboardShortcuts
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          onPause={togglePause}
        />
      )}

      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncements
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={task?.questions?.length || 0}
        isCorrect={isCurrentCorrect}
        showFeedback={showFeedback}
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />
    </>
  );
};

export default MultipleChoiceTaskPage;
