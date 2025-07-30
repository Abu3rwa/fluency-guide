import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Alert,
  Chip,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StudentTaskLayout from "../components/StudentTaskLayout";
import StudentFillInBlanksQuestionCard from "./StudentFillInBlanksQuestionCard";
import StudentFillInBlanksOptionList from "./StudentFillInBlanksOptionList";
import StudentFillInBlanksFeedbackSection from "./StudentFillInBlanksFeedbackSection";
import { useStudentTask } from "../../../../contexts/studentTaskContext";
import StudentTaskResultsPage from "../components/StudentTaskResultsPage";
import { playCorrectSound, playIncorrectSound } from "../utils/audioUtils";

const FillInBlanksTaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const { getTaskById, submitTaskAttempt } = useStudentTask();

  // State
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState({});
  const [blanksCorrectness, setBlanksCorrectness] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [usedOptions, setUsedOptions] = useState([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);

  const [isPaused, setIsPaused] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [resumeDialogHandled, setResumeDialogHandled] = useState(false);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [questionOptions, setQuestionOptions] = useState({}); // Store shuffled options per question

  // Mobile and accessibility support
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Get current question options with inline generation
  const currentQuestionOptions = useMemo(() => {
    const currentQuestion = task?.questions?.[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.blanks)
      return { available: [], used: [] };

    // Use stored options if available
    let allOptions = questionOptions[currentQuestion.id];

    // Generate options if not available (but don't store them to avoid re-renders)
    if (!allOptions) {
      const correctAnswers = currentQuestion.blanks.map((b) => b.answer);
      const distractors = (currentQuestion.options || []).filter(
        (opt) => !correctAnswers.includes(opt)
      );

      allOptions = [...new Set([...correctAnswers, ...distractors])];

      if (allOptions.length < currentQuestion.blanks.length) {
        const needed = currentQuestion.blanks.length - allOptions.length;
        for (let i = 0; i < needed; i++) {
          allOptions.push(`Option ${i + 1}`);
        }
      }

      // Shuffle options only once per question
      allOptions.sort(() => 0.5 - Math.random());
    }

    const currentAnswersForQuestion =
      userAnswers[currentQuestion.id] ||
      Array(currentQuestion.blanks.length).fill("");
    const used = currentAnswersForQuestion.filter((ans) => ans !== "");

    return {
      available: allOptions.filter((opt) => !used.includes(opt)),
      used: used,
    };
  }, [task, currentQuestionIndex, userAnswers, questionOptions]);

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
  }, []);

  const showNotification = useCallback((message, severity = "info") => {
    setNotification({ open: true, message, severity });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const initializeQuestionState = useCallback(
    (question) => {
      if (!question || !question.blanks) return;

      // Check if we already have shuffled options for this question
      if (!questionOptions[question.id]) {
        const correctAnswers = question.blanks.map((b) => b.answer);
        const distractors = (question.options || []).filter(
          (opt) => !correctAnswers.includes(opt)
        );

        let allOptions = [...new Set([...correctAnswers, ...distractors])];

        if (allOptions.length < question.blanks.length) {
          const needed = question.blanks.length - allOptions.length;
          for (let i = 0; i < needed; i++) {
            allOptions.push(`Option ${i + 1}`);
          }
        }

        // Shuffle options only once per question
        allOptions.sort(() => 0.5 - Math.random());

        // Store the shuffled options for this question
        setQuestionOptions((prev) => ({
          ...prev,
          [question.id]: allOptions,
        }));
      }

      // Use stored options or create new ones
      const allOptions = questionOptions[question.id] || [];

      const currentAnswersForQuestion =
        userAnswers[question.id] || Array(question.blanks.length).fill("");
      const used = currentAnswersForQuestion.filter((ans) => ans !== "");

      setAvailableOptions(allOptions.filter((opt) => !used.includes(opt)));
      setUsedOptions(used);
      setBlanksCorrectness(null);
      setSelectedBlankIndex(null);

      if (!userAnswers[question.id]) {
        setUserAnswers((prev) => ({
          ...prev,
          [question.id]: Array(question.blanks.length).fill(""),
        }));
      }
    },
    [userAnswers, questionOptions]
  );

  useEffect(() => {
    const fetchTask = async () => {
      const maxRetries = 3;
      let currentRetry = 0;

      const attemptFetch = async () => {
        try {
          setLoading(true);
          setError(null);

          const taskData = await getTaskById(taskId);
          if (taskData) {
            setTask(taskData);
            const savedProgress = localStorage.getItem(
              `quiz_progress_${taskId}`
            );
            if (savedProgress) {
              try {
                const progress = JSON.parse(savedProgress);
                const lastSaved = new Date(
                  progress.lastSavedTime || progress.quizStartTime
                );
                const now = new Date();
                const hoursSinceLastSaved =
                  (now - lastSaved) / (1000 * 60 * 60);

                // Only show resume dialog if progress is less than 24 hours old and dialog hasn't been handled
                if (hoursSinceLastSaved < 24 && !resumeDialogHandled) {
                  setSavedProgress(progress);
                  setShowResumeDialog(true);
                  // Also restore pause state if it was paused
                  if (progress.isPaused) {
                    setIsPaused(true);
                  }
                } else {
                  // Clear old progress
                  localStorage.removeItem(`quiz_progress_${taskId}`);
                  setSecondsRemaining((taskData.timeLimit || 0) * 60);
                  setQuizStartTime(Date.now());
                }
              } catch (progressError) {
                console.warn("Error parsing saved progress:", progressError);
                localStorage.removeItem(`quiz_progress_${taskId}`);
                setSecondsRemaining((taskData.timeLimit || 0) * 60);
                setQuizStartTime(Date.now());
              }
            } else {
              setSecondsRemaining((taskData.timeLimit || 0) * 60);
              setQuizStartTime(Date.now());
            }
            setTotalPoints(
              taskData.questions.reduce(
                (acc, q) => acc + (q.blanks?.length || 0),
                0
              )
            );

            const questionIndex = savedProgress
              ? JSON.parse(savedProgress).currentQuestionIndex || 0
              : 0;
            initializeQuestionState(taskData.questions[questionIndex]);

            setRetryCount(0); // Reset retry count on success
            setLoading(false); // Set loading to false on success
          } else {
            setError(t("tasks.taskNotFound"));
            setLoading(false); // Set loading to false when task not found
          }
        } catch (err) {
          console.error("Error fetching task:", err);
          currentRetry++;

          if (currentRetry < maxRetries && isOnline) {
            showNotification(
              `Loading failed. Retrying... (${currentRetry}/${maxRetries})`,
              "warning"
            );
            setTimeout(() => attemptFetch(), 2000 * currentRetry); // Exponential backoff
          } else {
            const errorMessage = !isOnline
              ? t("tasks.noInternetConnection")
              : err.message || t("tasks.failedToLoadTask");
            setError(errorMessage);
            showNotification(errorMessage, "error");
            setLoading(false); // Set loading to false on error
          }
        }
      };

      attemptFetch();
    };

    fetchTask();
  }, [
    taskId,
    getTaskById,
    t,
    initializeQuestionState,
    isOnline,
    showNotification,
    resumeDialogHandled,
  ]);

  const saveProgress = useCallback(async () => {
    try {
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
      };
      localStorage.setItem(`quiz_progress_${taskId}`, JSON.stringify(progress));
    } catch (err) {
      console.error("Error saving progress:", err);
      showNotification(t("tasks.failedToSaveProgress"), "warning");
    }
  }, [
    currentQuestionIndex,
    userAnswers,
    isAnswered,
    score,
    secondsRemaining,
    quizStartTime,
    taskId,
    showNotification,
  ]);

  useEffect(() => {
    const interval = setInterval(saveProgress, 15000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  const handleSubmit = useCallback(async () => {
    if (quizCompleted) return;

    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

    console.log("Calculating final score..."); // Debug log
    console.log("User answers:", userAnswers); // Debug log
    console.log("Task questions:", task.questions); // Debug log

    let finalScore = 0;
    task.questions.forEach((q, qIndex) => {
      const answers = userAnswers[q.id] || [];
      console.log(`Question ${qIndex + 1} answers:`, answers); // Debug log
      console.log(`Question ${qIndex + 1} blanks:`, q.blanks); // Debug log

      q.blanks.forEach((blank, index) => {
        const userAnswer = answers[index];
        const correctAnswer = blank.answer;
        const isCorrect =
          userAnswer &&
          userAnswer.trim().toLowerCase() ===
            correctAnswer.trim().toLowerCase();

        console.log(
          `Blank ${
            index + 1
          }: User="${userAnswer}", Correct="${correctAnswer}", IsCorrect=${isCorrect}`
        ); // Debug log

        if (isCorrect) {
          finalScore++;
        }
      });
    });

    console.log("Final score calculated:", finalScore); // Debug log
    console.log("Total points:", totalPoints); // Debug log

    setScore(finalScore);
    setQuizCompleted(true);

    // Save final results locally first
    try {
      const finalResults = {
        taskId,
        userAnswers,
        timeSpent,
        finalScore,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        `quiz_results_${taskId}`,
        JSON.stringify(finalResults)
      );
    } catch (localErr) {
      console.error("Error saving results locally:", localErr);
    }

    // Attempt to submit to server
    const maxRetries = 3;
    let currentRetry = 0;

    const attemptSubmit = async () => {
      try {
        await submitTaskAttempt(taskId, userAnswers, timeSpent, finalScore);
        showNotification(t("tasks.quizSubmittedSuccessfully"), "success");
        // Clear local results after successful submission
        localStorage.removeItem(`quiz_results_${taskId}`);
        localStorage.removeItem(`quiz_progress_${taskId}`);
      } catch (err) {
        console.error("Error submitting task:", err);
        currentRetry++;

        if (currentRetry < maxRetries && isOnline) {
          showNotification(
            `Submission failed. Retrying... (${currentRetry}/${maxRetries})`,
            "warning"
          );
          setTimeout(() => attemptSubmit(), 2000 * currentRetry);
        } else {
          const errorMessage = !isOnline
            ? t("tasks.noInternetSubmission")
            : t("tasks.submissionFailed");
          showNotification(errorMessage, "warning");
          setError(null); // Don't show error state, just notification
        }
      }
    };

    attemptSubmit();
  }, [
    quizCompleted,
    quizStartTime,
    task,
    userAnswers,
    submitTaskAttempt,
    taskId,
    isOnline,
    showNotification,
  ]);

  useEffect(() => {
    if (secondsRemaining > 0 && !quizCompleted && !isPaused) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (secondsRemaining === 0 && quizStartTime && !quizCompleted) {
      handleSubmit();
    }
  }, [secondsRemaining, quizCompleted, quizStartTime, handleSubmit, isPaused]);

  // Add 30-second warning functionality
  useEffect(() => {
    if (secondsRemaining === 30 && !quizCompleted && !isPaused) {
      // Show time warning
      alert(t("tasks.thirtySecondsWarning") || "Only 30 seconds remaining!");
    }
  }, [secondsRemaining, quizCompleted, isPaused, t]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newPaused = !prev;

      // Save progress when pausing/unpausing
      setTimeout(() => {
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
          isPaused: newPaused,
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );
      }, 100);

      return newPaused;
    });
  }, [
    currentQuestionIndex,
    userAnswers,
    isAnswered,
    score,
    secondsRemaining,
    quizStartTime,
    taskId,
  ]);

  const handleResumeQuiz = () => {
    console.log("Resume quiz clicked"); // Debug log
    console.log("Saved progress:", savedProgress); // Debug log

    if (savedProgress) {
      console.log("Restoring progress..."); // Debug log

      // First, set all the state
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex || 0);
      setUserAnswers(savedProgress.userAnswers || {});
      setIsAnswered(savedProgress.isAnswered || {});
      setScore(savedProgress.score || 0);
      setSecondsRemaining(savedProgress.secondsRemaining || 0);
      setQuizStartTime(new Date(savedProgress.quizStartTime));
      setSelectedBlankIndex(null);
      setBlanksCorrectness(null);
      setIsPaused(savedProgress.isPaused || false);

      // Then initialize question state after a short delay to ensure state is set
      setTimeout(() => {
        if (task?.questions?.[savedProgress.currentQuestionIndex || 0]) {
          console.log("Initializing question state..."); // Debug log
          initializeQuestionState(
            task.questions[savedProgress.currentQuestionIndex || 0]
          );
        }
      }, 50);

      // Save progress after resuming
      setTimeout(() => {
        const progress = {
          currentQuestionIndex: savedProgress.currentQuestionIndex || 0,
          userAnswers: savedProgress.userAnswers || {},
          isAnswered: savedProgress.isAnswered || {},
          score: savedProgress.score || 0,
          secondsRemaining: savedProgress.secondsRemaining || 0,
          quizStartTime:
            savedProgress.quizStartTime || new Date().toISOString(),
          lastSavedTime: new Date().toISOString(),
          isPaused: savedProgress.isPaused || false,
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );
        console.log("Progress saved after resume"); // Debug log
      }, 100);
    } else {
      console.log("No saved progress found"); // Debug log
    }
    console.log("Closing resume dialog"); // Debug log
    setShowResumeDialog(false);
    setSavedProgress(null);
    setResumeDialogHandled(true);
  };

  const handleStartOver = () => {
    console.log("Start over clicked"); // Debug log
    localStorage.removeItem(`quiz_progress_${taskId}`);
    setSecondsRemaining((task?.timeLimit || 0) * 60);
    setQuizStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAnswered({});
    setScore(0);
    setBlanksCorrectness(null);
    setIsPaused(false);
    setQuestionOptions({}); // Clear stored options for fresh shuffling

    // Initialize question state after a short delay to ensure state is set
    setTimeout(() => {
      if (task?.questions?.[0]) {
        console.log("Initializing first question state"); // Debug log
        initializeQuestionState(task.questions[0]);
      }
    }, 50);

    console.log("Closing resume dialog"); // Debug log
    setShowResumeDialog(false);
    setSavedProgress(null);
    setResumeDialogHandled(true);

    // Save initial progress after starting over
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
      console.log("Initial progress saved after start over"); // Debug log
    }, 100);
  };

  const checkAnswers = useCallback(
    (question, answers) => {
      if (!question || !answers) return;
      const correctness = answers.map((answer, index) => {
        return (
          answer.trim().toLowerCase() ===
          question.blanks[index]?.answer.trim().toLowerCase()
        );
      });
      setBlanksCorrectness(correctness);

      // Only mark as answered if ALL answers are correct
      const allCorrect = correctness.every((c) => c);
      if (allCorrect) {
        setIsAnswered((prev) => ({ ...prev, [question.id]: true }));
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Save progress when checking answers
      setTimeout(() => {
        const progress = {
          currentQuestionIndex,
          userAnswers,
          isAnswered: allCorrect
            ? { ...isAnswered, [question.id]: true }
            : isAnswered,
          score,
          secondsRemaining,
          quizStartTime: quizStartTime
            ? new Date(quizStartTime).toISOString()
            : new Date().toISOString(),
          lastSavedTime: new Date().toISOString(),
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );
      }, 100);
    },
    [
      currentQuestionIndex,
      userAnswers,
      isAnswered,
      score,
      secondsRemaining,
      quizStartTime,
      taskId,
    ]
  );

  useEffect(() => {
    if (!task || !task.questions) return;
    const question = task.questions[currentQuestionIndex];
    if (!question) return;

    const currentAnswers = userAnswers[question.id];
    if (currentAnswers && currentAnswers.every((ans) => ans !== "")) {
      if (!isAnswered[question.id]) {
        checkAnswers(question, currentAnswers);
      }
    }
  }, [userAnswers, currentQuestionIndex, task, isAnswered, checkAnswers]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < task.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      initializeQuestionState(task.questions[nextIndex]);

      // Save progress when navigating to next question
      setTimeout(() => {
        const progress = {
          currentQuestionIndex: nextIndex,
          userAnswers,
          isAnswered,
          score,
          secondsRemaining,
          quizStartTime: quizStartTime
            ? new Date(quizStartTime).toISOString()
            : new Date().toISOString(),
          lastSavedTime: new Date().toISOString(),
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );
      }, 100);
    } else {
      handleSubmit();
    }
  }, [
    currentQuestionIndex,
    task,
    initializeQuestionState,
    handleSubmit,
    userAnswers,
    isAnswered,
    score,
    secondsRemaining,
    quizStartTime,
    taskId,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      initializeQuestionState(task.questions[prevIndex]);

      // Save progress when navigating to previous question
      setTimeout(() => {
        const progress = {
          currentQuestionIndex: prevIndex,
          userAnswers,
          isAnswered,
          score,
          secondsRemaining,
          quizStartTime: quizStartTime
            ? new Date(quizStartTime).toISOString()
            : new Date().toISOString(),
          lastSavedTime: new Date().toISOString(),
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );
      }, 100);
    }
  }, [
    currentQuestionIndex,
    initializeQuestionState,
    userAnswers,
    isAnswered,
    score,
    secondsRemaining,
    quizStartTime,
    taskId,
  ]);

  const handleBlankClick = (blankIndex) => {
    const questionId = task.questions[currentQuestionIndex].id;
    const currentAnswer = userAnswers[questionId]?.[blankIndex];

    if (currentAnswer) {
      // If blank has an answer, remove it
      handleBlankRemove(blankIndex);
    } else {
      // If blank is empty, select it for next option click
      setSelectedBlankIndex(blankIndex);
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (event) => {
      // Don't interfere with form inputs or when dialogs are open
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        showResumeDialog
      ) {
        return;
      }

      // Calculate if current question is answered
      const currentQuestion = task?.questions?.[currentQuestionIndex];
      const isCurrentAnswered = currentQuestion
        ? isAnswered[currentQuestion.id] || false
        : false;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentQuestionIndex > 0) {
            handlePrevious();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentQuestionIndex < task.questions.length - 1) {
            handleNext();
          } else if (isCurrentAnswered) {
            handleSubmit();
          }
          break;
        case "Enter":
          event.preventDefault();
          if (isCurrentAnswered) {
            if (currentQuestionIndex < task.questions.length - 1) {
              handleNext();
            } else {
              handleSubmit();
            }
          }
          break;
        case "Escape":
          event.preventDefault();
          setSelectedBlankIndex(null);
          break;
        case " ":
          if (event.target === document.body) {
            event.preventDefault();
            togglePause();
          }
          break;
        default:
          // Number keys 1-9 to select blanks
          if (event.key >= "1" && event.key <= "9") {
            const blankIndex = parseInt(event.key) - 1;
            const currentQuestion = task.questions[currentQuestionIndex];
            if (blankIndex < currentQuestion.blanks.length) {
              event.preventDefault();
              handleBlankClick(blankIndex);
            }
          }
          break;
      }
    },
    [
      currentQuestionIndex,
      task,
      isAnswered,
      showResumeDialog,
      handleNext,
      handlePrevious,
      handleSubmit,
      togglePause,
      handleBlankClick,
    ]
  );

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleBlankAccept = (option, blankIndex) => {
    const questionId = task.questions[currentQuestionIndex].id;

    setUserAnswers((prev) => {
      const newAnswers = [...(prev[questionId] || [])];
      newAnswers[blankIndex] = option;
      const updatedAnswers = { ...prev, [questionId]: newAnswers };

      // Save progress immediately after updating answers (without setTimeout)
      const progress = {
        currentQuestionIndex,
        userAnswers: updatedAnswers,
        isAnswered,
        score,
        secondsRemaining,
        quizStartTime: quizStartTime
          ? new Date(quizStartTime).toISOString()
          : new Date().toISOString(),
        lastSavedTime: new Date().toISOString(),
      };
      localStorage.setItem(`quiz_progress_${taskId}`, JSON.stringify(progress));

      return updatedAnswers;
    });

    setBlanksCorrectness(null);
  };

  const handleBlankRemove = (blankIndex) => {
    const questionId = task.questions[currentQuestionIndex].id;
    const optionToRemove = userAnswers[questionId]?.[blankIndex];

    if (optionToRemove) {
      setUserAnswers((prev) => {
        const newAnswers = [...prev[questionId]];
        newAnswers[blankIndex] = "";
        const updatedAnswers = { ...prev, [questionId]: newAnswers };

        // Save progress immediately after removing answers (without setTimeout)
        const progress = {
          currentQuestionIndex,
          userAnswers: updatedAnswers,
          isAnswered,
          score,
          secondsRemaining,
          quizStartTime: quizStartTime
            ? new Date(quizStartTime).toISOString()
            : new Date().toISOString(),
          lastSavedTime: new Date().toISOString(),
        };
        localStorage.setItem(
          `quiz_progress_${taskId}`,
          JSON.stringify(progress)
        );

        return updatedAnswers;
      });

      setBlanksCorrectness(null);
      setIsAnswered((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleRestart = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAnswered({});
    setScore(0);
    setSecondsRemaining((task.timeLimit || 0) * 60);
    setQuizStartTime(Date.now());
    setQuestionOptions({}); // Clear stored options for fresh shuffling
    initializeQuestionState(task.questions[0]);
  };

  const handleOptionClick = useCallback(
    (option) => {
      const questionId = task.questions[currentQuestionIndex].id;
      const currentAnswers = userAnswers[questionId] || [];

      // If a blank is selected, fill it
      if (selectedBlankIndex !== null) {
        handleBlankAccept(option, selectedBlankIndex);
        setSelectedBlankIndex(null);
      } else {
        // Otherwise, find the next empty blank
        const nextBlankIndex = currentAnswers.findIndex(
          (answer) => answer === ""
        );
        if (nextBlankIndex !== -1) {
          handleBlankAccept(option, nextBlankIndex);
        }
      }
    },
    [
      currentQuestionIndex,
      task,
      userAnswers,
      selectedBlankIndex,
      handleBlankAccept,
    ]
  );

  const renderInstructions = () => {
    if (!showInstructions) return null;

    return (
      <Alert
        severity="info"
        sx={{
          mb: 2,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => setShowInstructions(false)}
          >
            {t("tasks.gotIt")}
          </Button>
        }
      >
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {isMobile ? (
            <>
              <TouchAppIcon fontSize="small" />
              <Typography variant="body2">
                {t("tasks.tapBlankSpace")}
              </Typography>
            </>
          ) : (
            <>
              <KeyboardIcon fontSize="small" />
              <Typography variant="body2">
                {t("tasks.clickBlankSpace")}
              </Typography>
            </>
          )}
        </Box>
      </Alert>
    );
  };

  if (loading) {
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

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!task || !task.questions || task.questions.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography>{t("tasks.noQuestions")}</Typography>
      </Box>
    );
  }

  if (quizCompleted) {
    const timeSpent = quizStartTime
      ? Math.round((Date.now() - quizStartTime) / 1000)
      : 0;
    const questionsAnswered = Object.values(isAnswered).filter(Boolean).length;

    console.log("Rendering results page with:"); // Debug log
    console.log("Score:", score); // Debug log
    console.log("Total points:", totalPoints); // Debug log
    console.log("Questions answered correctly:", questionsAnswered); // Debug log
    console.log("Total questions:", task.questions.length); // Debug log
    console.log("Time spent:", timeSpent); // Debug log

    return (
      <StudentTaskResultsPage
        score={score}
        totalPoints={totalPoints}
        onRestart={handleRestart}
        onFinish={() => navigate(-1)}
        task={task}
        timeSpent={timeSpent}
        questionsAnswered={questionsAnswered}
        totalQuestions={task.questions.length}
      />
    );
  }

  if (isPaused) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.background.default})`,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            textAlign: "center",
            maxWidth: { xs: "100%", sm: 400 },
            width: "100%",
          }}
        >
          <PauseIcon
            sx={{
              fontSize: { xs: 60, sm: 80 },
              color: "primary.main",
              mb: { xs: 1.5, sm: 2 },
            }}
          />
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            dir="auto"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              mb: { xs: 1, sm: 2 },
            }}
          >
            {t("tasks.quizPaused")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
            dir="auto"
          >
            {t("tasks.pauseMessage")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={togglePause}
            sx={{
              minWidth: { xs: 120, sm: 150 },
              minHeight: { xs: 48, sm: 56 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            {t("tasks.resume")}
          </Button>
        </Paper>
      </Box>
    );
  }

  const currentQuestion = task.questions[currentQuestionIndex];

  // Validate current question
  if (!currentQuestion || !currentQuestion.text || !currentQuestion.blanks) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">
          {t("tasks.invalidQuestionFormat")}
        </Typography>
      </Box>
    );
  }

  const currentAnswers =
    userAnswers[currentQuestion.id] ||
    Array(currentQuestion.blanks.length).fill("");
  const isCurrentAnswered = isAnswered[currentQuestion.id] || false;

  return (
    <>
      {/* Resume Dialog */}
      <Dialog
        open={showResumeDialog}
        onClose={() => {
          console.log("Dialog close attempted"); // Debug log
          // Allow closing with escape key or clicking outside
          setShowResumeDialog(false);
          setSavedProgress(null);
          setResumeDialogHandled(true);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            pb: { xs: 1, sm: 2 },
          }}
        >
          {t("tasks.resumeQuizTitle") || "Resume Quiz?"}
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            "& .MuiDialogContent-root": {
              p: { xs: 2, sm: 3 },
            },
          }}
        >
          <Typography
            dir="auto"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {t("tasks.resumeQuizContent") ||
              "You have a previously started quiz. Would you like to continue where you left off or start over?"}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            onClick={() => {
              console.log("Start over button clicked"); // Debug log
              handleStartOver();
            }}
            color="secondary"
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {t("tasks.startOver") || "Start Over"}
          </Button>
          <Button
            onClick={() => {
              console.log("Resume button clicked"); // Debug log
              handleResumeQuiz();
            }}
            variant="contained"
            color="primary"
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {t("tasks.resume") || "Resume"}
          </Button>
        </DialogActions>
      </Dialog>

      <StudentTaskLayout
        task={task}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={task.questions.length}
        timeRemaining={secondsRemaining}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        isAnswered={isCurrentAnswered}
        isLastQuestion={currentQuestionIndex === task.questions.length - 1}
        onPause={togglePause}
        isPaused={isPaused}
      >
        {/* Keyboard shortcuts help */}
        {!isMobile && (
          <Box
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1000,
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 1,
                fontSize: "0.75rem",
                maxWidth: 200,
                backgroundColor: theme.palette.background.paper + "E6",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, display: "block" }}
              >
                {t("tasks.keyboardShortcuts")}
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                {t("tasks.navigateQuestions")}
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                {t("tasks.selectBlanks")}
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                {t("tasks.pauseResume")}
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                {t("tasks.clearSelection")}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Screen reader announcements */}
        <Box
          component="div"
          sx={{
            position: "absolute",
            left: "-10000px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          aria-live="polite"
          aria-atomic="true"
          id="sr-announcements"
        >
          {t("tasks.questionOf", {
            current: currentQuestionIndex + 1,
            total: task.questions.length,
          })}
          . $
          {selectedBlankIndex !== null
            ? t("tasks.blankSelected", { index: selectedBlankIndex + 1 })
            : ""}
        </Box>

        {renderInstructions()}
        <div>
          <StudentFillInBlanksQuestionCard
            question={currentQuestion}
            userAnswers={currentAnswers}
            blanksCorrectness={blanksCorrectness}
            onBlankClick={handleBlankClick}
            selectedBlankIndex={selectedBlankIndex}
            isMobile={isMobile}
            isSmallScreen={isSmallScreen}
          />
        </div>
        <StudentFillInBlanksOptionList
          availableOptions={currentQuestionOptions.available}
          onOptionClick={handleOptionClick}
          isMobile={isMobile}
          isSmallScreen={isSmallScreen}
          selectedBlankIndex={selectedBlankIndex}
        />
        {task.showFeedback && blanksCorrectness && (
          <StudentFillInBlanksFeedbackSection
            blanksCorrectness={blanksCorrectness}
            explanation={currentQuestion.explanation}
          />
        )}
      </StudentTaskLayout>
    </>
  );
};

export default FillInBlanksTaskPage;
