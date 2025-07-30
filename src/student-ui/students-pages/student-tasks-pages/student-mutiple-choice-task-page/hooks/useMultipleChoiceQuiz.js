import { useState, useEffect, useCallback, useMemo } from "react";
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

  // Timer management
  useEffect(() => {
    if (!task || quizCompleted || isPaused || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [task, quizCompleted, isPaused, secondsRemaining]);

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

  // Submit task
  const handleSubmit = useCallback(async () => {
    if (!task || quizCompleted) return;

    try {
      const timeSpent = (task.timeLimit || 0) * 60 - secondsRemaining;

      await submitTaskAttempt(taskId, userAnswers, timeSpent, score);
      setQuizCompleted(true);
      localStorage.removeItem(`quiz_progress_${taskId}`);

      // Navigate to results
      navigate(`/student/task/${taskId}/results`, {
        state: {
          score,
          totalPoints,
          answers: userAnswers,
          task,
        },
      });
    } catch (error) {
      showNotification(t("tasks.submissionError"), "error");
    }
  }, [
    task,
    quizCompleted,
    userAnswers,
    score,
    totalPoints,
    secondsRemaining,
    submitTaskAttempt,
    taskId,
    navigate,
    t,
    showNotification,
  ]);

  // Answer handling
  const handleAnswer = useCallback(
    (questionId, answer) => {
      if (!task) return;

      const isCorrect =
        task.questions[currentQuestionIndex].correctAnswer === answer;

      setUserAnswers((prev) => {
        const newAnswers = { ...prev, [questionId]: answer };
        return newAnswers;
      });

      setIsAnswered((prev) => ({ ...prev, [questionId]: true }));
      setIsCurrentCorrect(isCorrect);
      setShowFeedback(true);

      // Play sound feedback
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Auto-advance after 2 seconds
      setTimeout(() => {
        if (currentQuestionIndex < task.questions.length - 1) {
          handleNext();
        } else {
          handleSubmit();
        }
      }, 2000);
    },
    [task, currentQuestionIndex, handleSubmit]
  );

  // Navigation
  const handleNext = useCallback(() => {
    if (!task || currentQuestionIndex >= task.questions.length - 1) {
      handleSubmit();
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setShowFeedback(false);
  }, [task, currentQuestionIndex, handleSubmit]);

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
  }, [task]);

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
