import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import StudentTaskLayout from "../components/StudentTaskLayout";
import StudentTaskResultsPage from "../components/StudentTaskResultsPage";
import { useMultipleChoiceQuiz } from "./hooks/useMultipleChoiceQuiz";
import { useStudyTimer } from "../../../../hooks/useStudyTimer";
import { useStudyTime } from "../../../../contexts/StudyTimeContext";
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

  // Study time tracking
  const { startSession, endSession, isSessionActive } = useStudyTime();
  const { timeout } = useStudyTimer(5 * 60 * 1000); // 5 minutes timeout for task pages

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

  // Start study session when task loads
  React.useEffect(() => {
    if (task && !isSessionActive) {
      startSession();
    }
  }, [task, isSessionActive, startSession]);

  // End session when component unmounts
  React.useEffect(() => {
    return () => {
      if (isSessionActive) {
        endSession();
      }
    };
  }, [isSessionActive, endSession]);

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

  // Show main quiz interface
  return (
    <StudentTaskLayout
      task={task}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={task?.questions?.length || 0}
      isPaused={isPaused}
      onPause={togglePause}
      onResume={handleResumeQuiz}
    >
      {/* Instructions Alert */}
      <InstructionsAlert
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        task={task}
      />

      {/* Resume Dialog */}
      <ResumeDialog
        open={showResumeDialog}
        onClose={handleResumeDialogClose}
        onResume={handleResumeQuiz}
        onStartOver={handleStartOver}
        savedProgress={savedProgress}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onNext={handleNext}
        onPrevious={handlePrevious}
        onAnswer={handleAnswer}
        onSubmit={handleSubmit}
        isPaused={isPaused}
        onPause={togglePause}
      />

      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncements
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={task?.questions?.length || 0}
        isCurrentCorrect={isCurrentCorrect}
        showFeedback={showFeedback}
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />

      {/* Main Quiz Content */}
      <QuizContent
        task={task}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswer={selectedAnswer}
        isCurrentAnswered={isCurrentAnswered}
        isLastQuestion={isLastQuestion}
        showFeedback={showFeedback}
        isCurrentCorrect={isCurrentCorrect}
        secondsRemaining={secondsRemaining}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        isMobile={isMobile}
        isSmallScreen={isSmallScreen}
      />
    </StudentTaskLayout>
  );
};

export default MultipleChoiceTaskPage;
