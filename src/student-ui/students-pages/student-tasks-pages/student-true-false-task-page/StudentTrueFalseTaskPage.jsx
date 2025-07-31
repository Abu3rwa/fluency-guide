import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Typography } from "@mui/material";
import StudentTaskLayout from "../components/StudentTaskLayout";
import StudentTrueFalseQuestionCard from "./StudentTrueFalseQuestionCard";
import StudentTrueFalseAnswerButtons from "./StudentTrueFalseAnswerButtons";
import StudentTrueFalseFeedbackSection from "./StudentTrueFalseFeedbackSection";
import { useStudentTask } from "../../../../contexts/studentTaskContext";
import StudentTaskResultsPage from "../components/StudentTaskResultsPage";
import { useStudyTimer } from "../../../../hooks/useStudyTimer";
import { useStudyTime } from "../../../../contexts/StudyTimeContext";

const TrueFalseTaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTaskById, submitTaskAttempt } = useStudentTask();

  // Study time tracking
  const { startSession, endSession, isSessionActive } = useStudyTime();
  const { timeout } = useStudyTimer(5 * 60 * 1000); // 5 minutes timeout for task pages

  // State
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState({});
  const [isCorrect, setIsCorrect] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // Start study session when task loads
  useEffect(() => {
    if (task && !isSessionActive) {
      startSession();
    }
  }, [task, isSessionActive, startSession]);

  // End session when component unmounts
  useEffect(() => {
    return () => {
      if (isSessionActive) {
        endSession();
      }
    };
  }, [isSessionActive, endSession]);

  const handleSubmit = useCallback(async () => {
    if (quizCompleted) return;

    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

    let finalScore = 0;
    task.questions.forEach((q) => {
      const correctAnswer =
        String(q.correctAnswer || "").toLowerCase() === "true";
      if (userAnswers[q.id] === correctAnswer) {
        finalScore++;
      }
    });

    setScore(finalScore);
    setQuizCompleted(true);

    try {
      await submitTaskAttempt(taskId, userAnswers, timeSpent, finalScore);
    } catch (err) {
      setError(err.message);
    }
  }, [
    quizCompleted,
    quizStartTime,
    task,
    userAnswers,
    submitTaskAttempt,
    taskId,
  ]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskData = await getTaskById(taskId);
        if (taskData) {
          setTask(taskData);
          setSecondsRemaining((taskData.timeLimit || 0) * 60);
          setQuizStartTime(Date.now());
          setTotalPoints(taskData.questions.length);
        } else {
          setError(t("tasks.taskNotFound"));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, getTaskById, t]);

  useEffect(() => {
    if (secondsRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (secondsRemaining === 0 && quizStartTime && !quizCompleted) {
      handleSubmit();
    }
  }, [secondsRemaining, quizCompleted, quizStartTime, handleSubmit]);

  const handleAnswer = (answer) => {
    const questionId = task.questions[currentQuestionIndex].id;
    if (isAnswered[questionId]) return;

    const correctAnswer =
      String(
        task.questions[currentQuestionIndex].correctAnswer || ""
      ).toLowerCase() === "true";
    const isAnswerCorrect = answer === correctAnswer;

    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setIsAnswered((prev) => ({ ...prev, [questionId]: true }));
    setIsCorrect(isAnswerCorrect);
  };

  const handleNext = () => {
    if (currentQuestionIndex < task.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsCorrect(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAnswered({});
    setIsCorrect(null);
    setQuizCompleted(false);
    setScore(0);
    setSecondsRemaining((task.timeLimit || 0) * 60);
    setQuizStartTime(Date.now());
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (quizCompleted) {
    return (
      <StudentTaskResultsPage
        score={score}
        totalPoints={totalPoints}
        task={task}
        onRestart={handleRestart}
      />
    );
  }

  const currentQuestion = task.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === task.questions.length - 1;

  return (
    <StudentTaskLayout
      task={task}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={task.questions.length}
      timeRemaining={secondsRemaining}
      isAnswered={isAnswered[currentQuestion.id]}
      isLastQuestion={isLastQuestion}
    >
      <StudentTrueFalseQuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={task.questions.length}
      />

      <StudentTrueFalseAnswerButtons
        onAnswer={handleAnswer}
        disabled={isAnswered[currentQuestion.id]}
      />

      {isCorrect !== null && (
        <StudentTrueFalseFeedbackSection
          isCorrect={isCorrect}
          onNext={handleNext}
          isLastQuestion={isLastQuestion}
        />
      )}
    </StudentTaskLayout>
  );
};

export default TrueFalseTaskPage;
