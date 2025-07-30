import React, { createContext, useContext, useState, useCallback } from "react";
import * as studentTaskService from "../services/student-services/studentTaskService";

const StudentTaskContext = createContext();

export const StudentTaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({});
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const getTaskById = useCallback(async (taskId) => {
    setLoading((prev) => ({ ...prev, [taskId]: true }));
    setError((prev) => ({ ...prev, [taskId]: null }));

    try {
      const task = await studentTaskService.getTaskById(taskId);
      if (task) {
        setTasks((prev) => ({ ...prev, [taskId]: task }));
        return task;
      } else {
        throw new Error("Task not found");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to load task";
      setError((prev) => ({ ...prev, [taskId]: errorMessage }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  }, []);

  const submitTaskAttempt = useCallback(
    async (taskId, userAnswers, timeSpent, finalScore) => {
      setLoading((prev) => ({ ...prev, [`submit_${taskId}`]: true }));
      setError((prev) => ({ ...prev, [`submit_${taskId}`]: null }));

      try {
        const attempt = await studentTaskService.submitTaskAttempt(
          taskId,
          userAnswers,
          timeSpent,
          finalScore
        );

        // Update progress with the new attempt
        setProgress((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            lastAttempt: attempt,
            bestScore: Math.max(prev[taskId]?.bestScore || 0, attempt.score),
            attempts: (prev[taskId]?.attempts || 0) + 1,
            isPassed: attempt.isPassed,
          },
        }));

        return attempt;
      } catch (err) {
        const errorMessage = err.message || "Failed to submit task attempt";
        setError((prev) => ({ ...prev, [`submit_${taskId}`]: errorMessage }));
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, [`submit_${taskId}`]: false }));
      }
    },
    []
  );

  const getTaskProgress = useCallback(async (taskId, userId) => {
    try {
      const progress = await studentTaskService.getTaskProgress(taskId, userId);
      setProgress((prev) => ({ ...prev, [taskId]: progress }));
      return progress;
    } catch (err) {
      console.error("Error getting task progress:", err);
      return 0.0;
    }
  }, []);

  const getUserProgress = useCallback(async (userId) => {
    try {
      const userProgress = await studentTaskService.getUserProgress(userId);
      return userProgress;
    } catch (err) {
      console.error("Error getting user progress:", err);
      return {};
    }
  }, []);

  const getTaskAttempts = useCallback(async (taskId, userId) => {
    try {
      const attempts = await studentTaskService.getTaskAttempts(taskId, userId);
      return attempts;
    } catch (err) {
      console.error("Error getting task attempts:", err);
      return [];
    }
  }, []);

  const value = {
    tasks,
    progress,
    loading,
    error,
    getTaskById,
    submitTaskAttempt,
    getTaskProgress,
    getUserProgress,
    getTaskAttempts,
    ...studentTaskService,
  };

  return (
    <StudentTaskContext.Provider value={value}>
      {children}
    </StudentTaskContext.Provider>
  );
};

export const useStudentTask = () => useContext(StudentTaskContext);
