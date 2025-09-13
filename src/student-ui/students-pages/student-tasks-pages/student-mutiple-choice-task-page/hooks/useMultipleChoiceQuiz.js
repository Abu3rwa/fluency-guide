import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStudentTask } from "../../../../../contexts/studentTaskContext";
import { playCorrectSound, playIncorrectSound } from "../../utils/audioUtils";

export const useMultipleChoiceQuiz = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTaskById, submitTaskAttempt } = useStudentTask();

  // Core state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission guard
  const [submissionTriggered, setSubmissionTriggered] = useState(false); // Prevent multiple submission triggers
  
  // Use refs to track submission state immediately for setTimeout closures
  const submissionStateRef = useRef({
    isSubmitting: false,
    submissionTriggered: false,
    quizCompleted: false
  });
  
  // Global submission lock to prevent race conditions
  const submissionLockRef = useRef(false);
  
  // Ref to track current userAnswers for timeout access
  const userAnswersRef = useRef({});

  // UI state
  const [isPaused, setIsPaused] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [resumeDialogHandled, setResumeDialogHandled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update submission state ref whenever state changes
  useEffect(() => {
    submissionStateRef.current = {
      isSubmitting,
      submissionTriggered,
      quizCompleted
    };
  }, [isSubmitting, submissionTriggered, quizCompleted]);

  // Update userAnswers ref whenever userAnswers changes
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification(t("tasks.connectionRestored"), "success");
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification(t("tasks.connectionLost"), "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [t]);

  const showNotification = useCallback((message, severity = "info") => {
    setNotification({ open: true, message, severity });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch task data
  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    console.log("useMultipleChoiceQuiz - fetchTask called with taskId:", taskId);

    const attemptFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("useMultipleChoiceQuiz - calling getTaskById...");
        const taskData = await getTaskById(taskId);
        console.log("useMultipleChoiceQuiz - getTaskById result:", taskData);

        if (!taskData) {
          console.error("useMultipleChoiceQuiz - Task not found");
          throw new Error("Task not found");
        }

        console.log("useMultipleChoiceQuiz - setting task data:", taskData);
        setTask(taskData);
        setTotalPoints(taskData.questions.length);
        setSecondsRemaining((taskData.timeLimit || 0) * 60);
        setQuizStartTime(Date.now());

        // Check for saved progress
        const savedProgress = localStorage.getItem(`quiz_progress_${taskId}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          const timeDiff =
            Date.now() - new Date(progress.lastSavedTime).getTime();
          const minutesDiff = timeDiff / (1000 * 60);

          // Only restore if within 24 hours
          if (minutesDiff < 1440) {
            setSavedProgress(progress);
            setShowResumeDialog(true);
          } else {
            localStorage.removeItem(`quiz_progress_${taskId}`);
          }
        }
      } catch (err) {
        console.error("useMultipleChoiceQuiz - Error fetching task:", err);
        setError(err.message);
        if (retryCount < 3) {
          console.log("useMultipleChoiceQuiz - Retrying in", 1000 * (retryCount + 1), "ms");
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            attemptFetch();
          }, 1000 * (retryCount + 1));
        } else {
          console.error("useMultipleChoiceQuiz - Max retries reached");
        }
      } finally {
        setLoading(false);
      }
    };

    await attemptFetch();
  }, [taskId, getTaskById, retryCount]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Save progress
  const saveProgress = useCallback(() => {
    if (!task) return;

    const progress = {
      currentQuestionIndex,
      userAnswers,
      isAnswered,
      score,
      secondsRemaining,
      quizStartTime: quizStartTime
        ? new Date(quizStartTime).toISOString()
        : new Date().toISOString(),
      lastSavedTime: new Date().toISOString(),
      isPaused,
    };
    localStorage.setItem(`quiz_progress_${taskId}`, JSON.stringify(progress));
  }, [
    task,
    currentQuestionIndex,
    userAnswers,
    isAnswered,
    score,
    secondsRemaining,
    quizStartTime,
    isPaused,
    taskId,
  ]);

  // Helper function for robust answer comparison
  const compareAnswers = useCallback((userAnswer, correctAnswer) => {
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
  }, []);

  // Recalculate score from scratch
  const recalculateScore = useCallback((answers) => {
    const answersToScore = answers || userAnswers;
    if (!task || !answersToScore) return 0;
    
    let correctCount = 0;
    console.log('=== SCORE RECALCULATION DEBUG ===');
    console.log('Recalculating score for task:', task.id);
    console.log('User answers object:', answersToScore);
    console.log('Total questions:', task.questions.length);
    
    task.questions.forEach((question, index) => {
      const userAnswer = answersToScore[question.id];
      
      console.log(`\n--- Question ${index + 1} (ID: ${question.id}) ---`);
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
        correctCount++;
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
    
    console.log('\n=== FINAL SCORE CALCULATION ===');
    console.log('Correct answers:', correctCount);
    console.log('Total questions:', task.questions.length);
    console.log('Final score:', correctCount, '/', task.questions.length);
    console.log('===============================\n');
    
    return correctCount;
  }, [task, userAnswers, compareAnswers]);

  // Submit task - moved earlier to avoid temporal dead zone issues
  const handleSubmit = useCallback(async () => {
    console.log('=== SUBMISSION START DEBUG ===');
    console.log('handleSubmit called - checking conditions:', {
      hasTask: !!task,
      quizCompleted,
      isSubmitting,
      submissionTriggered,
      submissionLocked: submissionLockRef.current,
      refState: submissionStateRef.current
    });
    
    // Check global submission lock first
    if (submissionLockRef.current) {
      console.log('Submit blocked: Global submission lock is active');
      return;
    }
    
    const finalUserAnswers = userAnswersRef.current;
    console.log('Current userAnswers at submission start (from ref):', finalUserAnswers);
    console.log('Current userAnswers keys:', Object.keys(finalUserAnswers));
    console.log('Expected question IDs:', task?.questions?.map(q => q.id));
    console.log('===================================\n');
    
    if (!task || quizCompleted || isSubmitting || submissionTriggered) {
      console.log('Submit blocked:', { hasTask: !!task, quizCompleted, isSubmitting, submissionTriggered });
      return;
    }
    
    // Set global lock immediately
    submissionLockRef.current = true;
    console.log('Global submission lock activated');

    setIsSubmitting(true); // Set submission guard
    setSubmissionTriggered(true); // Prevent additional triggers
    
    // Update ref immediately for setTimeout closures
    submissionStateRef.current.isSubmitting = true;
    submissionStateRef.current.submissionTriggered = true;
    
    console.log('Starting submission...');

    try {
      const timeSpent = (task.timeLimit || 0) * 60 - secondsRemaining;
      
      // Count all answered questions - use the actual task questions to ensure accuracy - with detailed debugging
      console.log('\n=== SUBMISSION QUESTIONS ANSWERED CALCULATION DEBUG ===');
      console.log('Total questions in task:', task.questions.length);
      console.log('User answers object keys:', Object.keys(finalUserAnswers));
      console.log('User answers object:', finalUserAnswers);
      
      const questionsAnsweredDebug = [];
      const questionsNotAnsweredDebug = [];
      
      task.questions.forEach((question, index) => {
        const answer = finalUserAnswers[question.id];
        const isMarkedAnswered = isAnswered[question.id];
        
        // More robust check: question is answered if it has a value OR is marked as answered
        const hasAnswer = answer !== undefined && answer !== null && answer !== '';
        const isQuestionAnswered = hasAnswer || isMarkedAnswered;
        
        console.log(`\nSubmission Question ${index + 1} (ID: ${question.id}):`);
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
        console.log('\n=== APPLYING FALLBACK COUNTING METHOD IN SUBMISSION ===');
        
        // Count based on isAnswered state as primary source
        const isAnsweredCount = Object.values(isAnswered).filter(Boolean).length;
        console.log('Questions marked as answered in isAnswered state:', isAnsweredCount);
        
        // Use the higher count between the two methods
        finalQuestionsAnswered = Math.max(questionsAnswered, isAnsweredCount);
        console.log('Using fallback count for submission:', finalQuestionsAnswered);
        console.log('=======================================================\n');
      }
      
      console.log('\n=== SUBMISSION QUESTIONS ANSWERED SUMMARY ===');
      console.log('Questions counted as ANSWERED:', questionsAnsweredDebug.length);
      console.log('Answered questions:', questionsAnsweredDebug);
      console.log('Questions counted as NOT ANSWERED:', questionsNotAnsweredDebug.length);
      console.log('Not answered questions:', questionsNotAnsweredDebug);
      console.log('Final questionsAnswered count:', finalQuestionsAnswered);
      console.log('===============================================\n');
      
      console.log('Submission data:', {
        totalQuestions: task.questions.length,
        questionsAnswered: finalQuestionsAnswered,
        userAnswers: Object.keys(finalUserAnswers),
        answeredQuestionIds: task.questions.filter(q => finalUserAnswers[q.id] !== undefined).map(q => q.id)
      });
      
      // Recalculate score to ensure accuracy
      const finalScore = recalculateScore(finalUserAnswers);
      setScore(finalScore);
 
      const result = await submitTaskAttempt(taskId, finalUserAnswers, timeSpent, finalScore);
      
      // Check if this was a duplicate submission
      if (result?.isDuplicate) {
        console.log('Duplicate submission detected, skipping navigation');
        return;
      }
      
      setQuizCompleted(true);
      localStorage.removeItem(`quiz_progress_${taskId}`);

      // Navigate to results
      navigate(`/student/task/${taskId}/results`, {
        state: {
          score: finalScore,
          totalPoints: task.questions.length,
          questionsAnswered: finalQuestionsAnswered,
          timeSpent,
          task,
        },
      });
    } catch (error) {
      console.error('Submission error:', error);
      showNotification(t("tasks.submissionError"), "error");
    } finally {
      setIsSubmitting(false); // Clear submission guard
      // Keep submissionTriggered true to prevent any late triggers
      // Release global lock
      submissionLockRef.current = false;
      console.log('Global submission lock released');
    }
  }, [
    task,
    quizCompleted,
    isSubmitting,
    userAnswers,
    totalPoints,
    secondsRemaining,
    submitTaskAttempt,
    taskId,
    navigate,
    t,
    showNotification,
    recalculateScore,
    submissionTriggered,
  ]);

  // Effect to ensure userAnswers state is properly synchronized
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('userAnswers state updated:', userAnswers);
      console.log('Total answers stored:', Object.keys(userAnswers).length);
      
      if (task?.questions) {
        const missingAnswers = task.questions.filter(q => !Object.prototype.hasOwnProperty.call(userAnswers, q.id));
        if (missingAnswers.length > 0) {
          console.log('Missing answers for questions:', missingAnswers.map(q => ({ id: q.id, text: q.question || q.text })));
        }
      }
    }
  }, [userAnswers, task]);

  // Timer management - moved after handleSubmit definition to avoid temporal dead zone
  useEffect(() => {
    if (!task || quizCompleted || isPaused || secondsRemaining <= 0 || isSubmitting || submissionTriggered) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          console.log('Timer expired, triggering submission');
          console.log('Timer expiry state check:', submissionStateRef.current);
          
          // Prevent double triggering using ref
          if (submissionStateRef.current.submissionTriggered || submissionStateRef.current.isSubmitting) {
            console.log('Timer submission blocked by ref state');
            return 0;
          }
          
          // Set both state and ref immediately
          setSubmissionTriggered(true);
          submissionStateRef.current.submissionTriggered = true;
          
          // Use setTimeout to avoid state update conflicts
          setTimeout(() => {
            const currentState = submissionStateRef.current;
            if (!currentState.isSubmitting && !currentState.quizCompleted) {
              console.log('Timer executing delayed submission');
              handleSubmit();
            } else {
              console.log('Timer delayed submission cancelled:', currentState);
            }
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [task, quizCompleted, isPaused, secondsRemaining, isSubmitting, submissionTriggered, handleSubmit]);

  // Answer handling
  const handleAnswer = useCallback(
    (questionId, answer) => {
      if (!task || isSubmitting || quizCompleted || submissionTriggered) return;

      const currentQuestion = task.questions[currentQuestionIndex];
      
      // For multiple choice, find the correct answer from options array
      let correctAnswer;
      if (currentQuestion.options && Array.isArray(currentQuestion.options)) {
        // Find the option that is marked as correct
        const correctOption = currentQuestion.options.find(option => option.isCorrect);
        correctAnswer = correctOption ? correctOption.text : undefined;
      } else {
        // Fallback to existing correctAnswer property for compatibility
        correctAnswer = currentQuestion.correctAnswer;
      }
      
      // Use robust comparison function
      const isCorrect = compareAnswers(answer, correctAnswer);
      
      // Get previous answer for this question
      const previousAnswer = userAnswers[questionId];
      
      // Calculate if previous answer was correct using same robust logic
      let wasPreviouslyCorrect = false;
      if (previousAnswer) {
        wasPreviouslyCorrect = compareAnswers(previousAnswer, correctAnswer);
      }

      // Update user answers immediately to prevent race conditions
      setUserAnswers((prev) => {
        const newAnswers = { ...prev, [questionId]: answer };
        console.log('Answer saved for question:', questionId, 'Answer:', answer);
        console.log('Updated userAnswers:', newAnswers);
        return newAnswers;
      });

      setIsAnswered((prev) => ({ ...prev, [questionId]: true }));
      setIsCurrentCorrect(isCorrect);
      
      // Update score based on answer change
      setScore(prev => {
        let newScore = prev;
        
        // If previously correct and now incorrect, subtract 1
        if (wasPreviouslyCorrect && !isCorrect) {
          newScore = Math.max(0, prev - 1);
        }
        // If previously incorrect (or no answer) and now correct, add 1
        else if (!wasPreviouslyCorrect && isCorrect) {
          newScore = prev + 1;
        }
        // If same correctness status, no change needed
        
        return newScore;
      });
      
      setShowFeedback(true);

      // Play sound feedback
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Auto-advance after 2 seconds - use ref for immediate state checking
      // Use a longer delay to ensure state updates are complete
      setTimeout(() => {
        const currentState = submissionStateRef.current;
        console.log('Auto-advance timeout check:', {
          isSubmitting: currentState.isSubmitting,
          submissionTriggered: currentState.submissionTriggered,
          quizCompleted: currentState.quizCompleted,
          submissionLocked: submissionLockRef.current
        });
        
        if (currentState.isSubmitting || currentState.quizCompleted || currentState.submissionTriggered || submissionLockRef.current) {
          console.log('Auto-advance blocked: submission state check failed or locked');
          return;
        }
        
        if (currentQuestionIndex < task.questions.length - 1) {
          handleNext();
        } else {
          console.log('Auto-advance: triggering final submission');
          
          // Use ref to get the most current userAnswers
          const currentUserAnswers = userAnswersRef.current;
          console.log('Final userAnswers before submission (from ref):', currentUserAnswers);
          
          // Set submission state immediately to prevent other triggers
          setSubmissionTriggered(true);
          submissionStateRef.current.submissionTriggered = true;
          
          // Add a small delay to ensure all state updates are committed
          setTimeout(() => {
            handleSubmit();
          }, 100);
        }
      }, 3000); // Increased to 3000ms to ensure all state updates are committed
    },
    [task, currentQuestionIndex, handleSubmit, userAnswers, isSubmitting, quizCompleted, submissionTriggered, compareAnswers]
  );

  // Navigation
  const handleNext = useCallback(() => {
    if (!task || isSubmitting || quizCompleted || submissionTriggered || submissionLockRef.current) {
      console.log('handleNext blocked:', { hasTask: !!task, isSubmitting, quizCompleted, submissionTriggered, submissionLocked: submissionLockRef.current });
      return;
    }

    if (currentQuestionIndex >= task.questions.length - 1) {
      console.log('handleNext: reached last question, checking submission state:', submissionStateRef.current);
      
      if (submissionStateRef.current.submissionTriggered || submissionStateRef.current.isSubmitting || submissionLockRef.current) {
        console.log('handleNext submission blocked by ref state or lock');
        return;
      }
      
      console.log('handleNext: triggering submission');
      // Set both state and ref immediately
      setSubmissionTriggered(true);
      submissionStateRef.current.submissionTriggered = true;
      handleSubmit();
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setShowFeedback(false);
  }, [task, currentQuestionIndex, handleSubmit, isSubmitting, quizCompleted, submissionTriggered]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setShowFeedback(false);
    }
  }, [currentQuestionIndex]);

  // Resume functionality
  const handleResumeQuiz = useCallback(() => {
    if (!savedProgress) return;

    setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
    setUserAnswers(savedProgress.userAnswers);
    setIsAnswered(savedProgress.isAnswered);
    setScore(savedProgress.score);
    setSecondsRemaining(savedProgress.secondsRemaining);
    setQuizStartTime(new Date(savedProgress.quizStartTime));
    setIsPaused(savedProgress.isPaused);
    setShowResumeDialog(false);
    setSavedProgress(null);
    setResumeDialogHandled(true);
  }, [savedProgress]);

  const handleStartOver = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAnswered({});
    setScore(0);
    setSecondsRemaining((task?.timeLimit || 0) * 60);
    setQuizStartTime(Date.now());
    setIsPaused(false);
    setShowResumeDialog(false);
    setSavedProgress(null);
    setResumeDialogHandled(true);

    // Save initial progress
    setTimeout(() => {
      const progress = {
        currentQuestionIndex: 0,
        userAnswers: {},
        isAnswered: {},
        score: 0,
        secondsRemaining: (task?.timeLimit || 0) * 60,
        quizStartTime: new Date().toISOString(),
        lastSavedTime: new Date().toISOString(),
        isPaused: false,
      };
      localStorage.setItem(`quiz_progress_${taskId}`, JSON.stringify(progress));
    }, 100);
  }, [task, taskId]);

  // Pause functionality
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Restart functionality
  const handleRestart = useCallback(() => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAnswered({});
    setScore(0);
    setSecondsRemaining((task?.timeLimit || 0) * 60);
    setQuizStartTime(Date.now());
    setIsSubmitting(false);
    setSubmissionTriggered(false);
    
    // Clear any cached progress
    localStorage.removeItem(`quiz_progress_${taskId}`);
    localStorage.removeItem(`quiz_results_${taskId}`);
    
    console.log('Quiz restarted, all progress cleared');
  }, [task, taskId]);

  // Computed values
  const currentQuestion = useMemo(() => {
    return task?.questions?.[currentQuestionIndex] || null;
  }, [task, currentQuestionIndex]);

  const selectedAnswer = useMemo(() => {
    return userAnswers[currentQuestion?.id] || null;
  }, [userAnswers, currentQuestion]);

  const isCurrentAnswered = useMemo(() => {
    return isAnswered[currentQuestion?.id] || false;
  }, [isAnswered, currentQuestion]);

  const isLastQuestion = useMemo(() => {
    return currentQuestionIndex === (task?.questions?.length || 0) - 1;
  }, [currentQuestionIndex, task]);

  return {
    // State
    task,
    loading,
    error,
    currentQuestionIndex,
    userAnswers,
    isAnswered,
    showFeedback,
    isCurrentCorrect,
    secondsRemaining,
    quizCompleted,
    score,
    totalPoints,
    quizStartTime,
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
    showNotification,
    hideNotification,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleResumeQuiz,
    handleStartOver,
    togglePause,
    handleRestart,
    fetchTask,
    saveProgress,
  };
};
