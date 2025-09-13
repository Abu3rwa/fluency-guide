import React, { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import StudentTaskLayout from "../components/StudentTaskLayout";
import StudentTaskResultsPage from "../components/StudentTaskResultsPage";
import { useMultipleChoiceQuiz } from "./hooks/useMultipleChoiceQuiz";
import { useStudyTimer } from "../../../../hooks/useStudyTimer";
import { useStudyTime } from "../../../../contexts/StudyTimeContext";
import {
  ResumeDialog,
  InstructionsAlert,
  ScreenReaderAnnouncements,
  NotificationSnackbar,
  LoadingState,
  QuizContent,
} from "./components";

const MultipleChoiceTaskPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mobile and accessibility support
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Study time tracking
  const { startSession, endSession, isSessionActive } = useStudyTime();
  const { timeout } = useStudyTimer(5 * 60 * 1000); // 5 minutes timeout for task pages

  // Custom hook for all quiz logic with performance optimization
  const {
    // State
    task,
    loading,
    error,
    currentQuestionIndex,
    isAnswered,
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
    userAnswers,
    quizStartTime,

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

  // Debug logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("MultipleChoiceTaskPage - loading:", loading);
      console.log("MultipleChoiceTaskPage - error:", error);
      console.log("MultipleChoiceTaskPage - task:", task);
    }
  }, [loading, error, task]);

  // Handle resume dialog close
  const handleResumeDialogClose = () => {
    if (!resumeDialogHandled) {
      setShowInstructions(false);
    }
  };

  // Show loading or error state with performance consideration
  if (loading || error) {
     
    return (
      <LoadingState 
        loading={loading} 
        error={error} 
        retryCount={retryCount}
      />
    );
  }
  
  // Show results if completed with performance optimization
  if (quizCompleted) {
    if (process.env.NODE_ENV === 'development') {
      console.log("MultipleChoiceTaskPage - showing StudentTaskResultsPage");
    }
    
    // Helper function for robust answer comparison
    const compareAnswers = (userAnswer, correctAnswer) => {
      if (!userAnswer || !correctAnswer) {
        return userAnswer === correctAnswer;
      }
      
      // Convert to strings and normalize
      const userStr = String(userAnswer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .normalize('NFD') // Normalize unicode characters
        .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
        
      const correctStr = String(correctAnswer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return userStr === correctStr;
    };
    
    // Recalculate score to ensure accuracy
    let finalScore = 0;
    console.log('=== RESULTS DISPLAY SCORE CALCULATION ===');
    console.log('Direct results display - recalculating score');
    console.log('Task questions:', task?.questions);
    console.log('User answers object:', userAnswers);
    
    if (task?.questions) {
      task.questions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        
        console.log(`\n--- Results Question ${index + 1} (ID: ${question.id}) ---`);
        console.log('Question text:', question.question || question.text);
        console.log('User answer value:', userAnswer);
        console.log('User answer type:', typeof userAnswer);
        
        // For multiple choice, find the correct answer from options array
        let correctAnswer;
        if (question.options && Array.isArray(question.options)) {
          console.log('Question options:', question.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })));
          // Find the option that is marked as correct
          const correctOption = question.options.find(option => option.isCorrect);
          correctAnswer = correctOption ? correctOption.text : undefined;
          console.log('Found correct option:', correctOption);
        } else {
          // Fallback to existing correctAnswer property for compatibility
          correctAnswer = question.correctAnswer;
          console.log('Using fallback correctAnswer property:', correctAnswer);
        }
        
        console.log('Correct answer value:', correctAnswer);
        console.log('Correct answer type:', typeof correctAnswer);
        
        // Use robust comparison function
        const isCorrect = compareAnswers(userAnswer, correctAnswer);
        
        console.log('Normalized user answer:', String(userAnswer || "").trim().toLowerCase());
        console.log('Normalized correct answer:', String(correctAnswer || "").trim().toLowerCase());
        console.log('Robust comparison result:', isCorrect);
        
        if (isCorrect) {
          finalScore++;
          console.log('✓ Question marked as CORRECT');
        } else {
          console.log('✗ Question marked as INCORRECT');
          // Additional debugging for failed matches
          const userTrimmed = String(userAnswer || "").trim();
          const correctTrimmed = String(correctAnswer || "").trim();
          console.log('Exact comparison result:', userTrimmed === correctTrimmed);
          console.log('Character codes - User:', userTrimmed.split('').map(c => c.charCodeAt(0)));
          console.log('Character codes - Correct:', correctTrimmed.split('').map(c => c.charCodeAt(0)));
        }
      });
    }
    
    console.log('\n=== FINAL RESULTS DISPLAY CALCULATION ===');
    console.log('Final calculated score for display:', finalScore, 'out of', task?.questions?.length);
    console.log('==========================================\n');
    
    // Calculate questions answered using the same logic as submission - with detailed debugging
    console.log('\n=== QUESTIONS ANSWERED CALCULATION DEBUG ===');
    console.log('Total questions in task:', task.questions.length);
    console.log('User answers object keys:', Object.keys(userAnswers));
    console.log('User answers object:', userAnswers);
    
    const questionsAnsweredDebug = [];
    const questionsNotAnsweredDebug = [];
    
    task.questions.forEach((question, index) => {
      const answer = userAnswers[question.id];
      const isMarkedAnswered = isAnswered[question.id];
      
      // More robust check: question is answered if it has a value OR is marked as answered
      const hasAnswer = answer !== undefined && answer !== null && answer !== '';
      const isQuestionAnswered = hasAnswer || isMarkedAnswered;
      
      console.log(`\nQuestion ${index + 1} (ID: ${question.id}):`);
      console.log('  Question text:', question.question || question.text);
      console.log('  Answer value:', answer);
      console.log('  Answer type:', typeof answer);
      console.log('  Is marked as answered in isAnswered state:', isMarkedAnswered);
      console.log('  Has valid answer value:', hasAnswer);
      console.log('  Is counted as answered (final):', isQuestionAnswered);
      
      if (isQuestionAnswered) {
        questionsAnsweredDebug.push({ index: index + 1, id: question.id, answer, isMarkedAnswered });
      } else {
        questionsNotAnsweredDebug.push({ index: index + 1, id: question.id, answer, isMarkedAnswered });
      }
    });
    
    const questionsAnswered = questionsAnsweredDebug.length;
    
    // Fallback: If questionsAnswered is less than expected, use alternative counting method
    let finalQuestionsAnswered = questionsAnswered;
    if (questionsAnswered < task.questions.length) {
      console.log('\n=== APPLYING FALLBACK COUNTING METHOD ===');
      
      // Count based on isAnswered state as primary source
      const isAnsweredCount = Object.values(isAnswered).filter(Boolean).length;
      console.log('Questions marked as answered in isAnswered state:', isAnsweredCount);
      
      // Use the higher count between the two methods
      finalQuestionsAnswered = Math.max(questionsAnswered, isAnsweredCount);
      console.log('Using fallback count:', finalQuestionsAnswered);
      console.log('===============================================\n');
    }
    
    console.log('\n=== QUESTIONS ANSWERED SUMMARY ===');
    console.log('Questions counted as ANSWERED:', questionsAnsweredDebug.length);
    console.log('Answered questions:', questionsAnsweredDebug);
    console.log('Questions counted as NOT ANSWERED:', questionsNotAnsweredDebug.length);
    console.log('Not answered questions:', questionsNotAnsweredDebug);
    console.log('Final questionsAnswered count:', finalQuestionsAnswered);
    console.log('=====================================\n');
    const totalQuestions = task?.questions?.length || 0;
    const timeSpent = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;
    const handleFinish = () => navigate("/student/courses");
    
    return (
      <StudentTaskResultsPage
        score={finalScore}
        totalPoints={totalQuestions}
        task={task}
        timeSpent={timeSpent}
        questionsAnswered={finalQuestionsAnswered}
        totalQuestions={totalQuestions}
        onRestart={handleRestart}
        onFinish={handleFinish}
      />
    );
  }

  // Show main quiz interface
  return (
    <StudentTaskLayout
      task={task}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={task?.questions?.length || 0}
      timeRemaining={secondsRemaining}
      isPaused={isPaused}
      onPause={togglePause}
      onResume={handleResumeQuiz}
      showTimer={true}
    >
      {/* Instructions Alert */}
      {showInstructions && (
        <InstructionsAlert
          open={showInstructions}
          onClose={() => setShowInstructions(false)}
          task={task}
        />
      )}

      {/* Resume Dialog */}
      {showResumeDialog && (
        <ResumeDialog
          open={showResumeDialog}
          onClose={handleResumeDialogClose}
          onResume={handleResumeQuiz}
          onStartOver={handleStartOver}
          savedProgress={savedProgress}
        />
      )}

      

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
