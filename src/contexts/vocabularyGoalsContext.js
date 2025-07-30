import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import studentVocabularyGoalService from "../services/student-services/studentVocabularyGoalService";
import {
  calculateProgressPercentage,
  isGoalCompleted,
} from "../student-ui/students-pages/student-vocabulary-building-page/utils/vocabularyHelpers";

const VocabularyGoalsContext = createContext();

export const VocabularyGoalsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // State for goals
  const [activeGoal, setActiveGoal] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState({
    goals: false,
  });
  const [error, setError] = useState({
    goals: null,
  });

  // Initialize goals when user changes
  useEffect(() => {
    if (userId) {
      fetchActiveGoal();
    }
  }, [userId]);

  // Fetch active goal
  const fetchActiveGoal = useCallback(async () => {
    if (!userId) return;

    setLoading((prev) => ({ ...prev, goals: true }));
    setError((prev) => ({ ...prev, goals: null }));

    try {
      const goal = await studentVocabularyGoalService.getActiveVocabularyGoal(
        userId
      );
      setActiveGoal(goal);
    } catch (err) {
      console.error("Error fetching active goal:", err);
      setError((prev) => ({ ...prev, goals: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, goals: false }));
    }
  }, [userId]);

  // Create vocabulary goal
  const createVocabularyGoal = useCallback(
    async (goalData) => {
      if (!userId) return;

      try {
        await studentVocabularyGoalService.createVocabularyGoal(
          userId,
          goalData
        );
        await fetchActiveGoal();
      } catch (err) {
        console.error("Error creating vocabulary goal:", err);
        throw err;
      }
    },
    [userId, fetchActiveGoal]
  );

  // Update goal progress
  const updateGoalProgress = useCallback(
    async (increment = 1) => {
      if (!activeGoal) return false;

      try {
        const result = await studentVocabularyGoalService.updateGoalProgress(
          activeGoal.id,
          increment
        );

        // Update active goal in state
        await fetchActiveGoal();

        // Check if goal is now completed
        const wasCompleted = isGoalCompleted(
          activeGoal.currentProgress,
          activeGoal.dailyTarget
        );
        const isNowCompleted = isGoalCompleted(
          result.currentProgress,
          activeGoal.dailyTarget
        );

        return !wasCompleted && isNowCompleted; // Return true if goal was just completed
      } catch (err) {
        console.error("Error updating goal progress:", err);
        throw err;
      }
    },
    [activeGoal, fetchActiveGoal]
  );

  // Reset goal progress
  const resetGoalProgress = useCallback(async () => {
    if (!activeGoal) return;

    try {
      await studentVocabularyGoalService.resetGoalProgress(activeGoal.id);
      await fetchActiveGoal();
    } catch (err) {
      console.error("Error resetting goal progress:", err);
      throw err;
    }
  }, [activeGoal, fetchActiveGoal]);

  // Delete goal
  const deleteGoal = useCallback(async () => {
    if (!activeGoal) return;

    try {
      await studentVocabularyGoalService.deleteVocabularyGoal(activeGoal.id);
      setActiveGoal(null);
    } catch (err) {
      console.error("Error deleting goal:", err);
      throw err;
    }
  }, [activeGoal]);

  // Memoized goal calculations
  const progressPercentage = useMemo(
    () =>
      activeGoal
        ? calculateProgressPercentage(
            activeGoal.currentProgress,
            activeGoal.dailyTarget
          )
        : 0,
    [activeGoal]
  );

  const goalCompleted = useMemo(
    () =>
      activeGoal
        ? isGoalCompleted(activeGoal.currentProgress, activeGoal.dailyTarget)
        : false,
    [activeGoal]
  );

  const goalStats = useMemo(() => {
    if (!activeGoal) return null;

    return {
      currentProgress: activeGoal.currentProgress,
      dailyTarget: activeGoal.dailyTarget,
      progressPercentage,
      goalCompleted,
      remainingWords: Math.max(
        0,
        activeGoal.dailyTarget - activeGoal.currentProgress
      ),
      isActive: activeGoal.isActive,
    };
  }, [activeGoal, progressPercentage, goalCompleted]);

  const value = {
    // Goal data
    activeGoal,
    goalStats,
    progressPercentage,
    goalCompleted,

    // Actions
    fetchActiveGoal,
    createVocabularyGoal,
    updateGoalProgress,
    resetGoalProgress,
    deleteGoal,

    // Loading and error states
    loading,
    error,
  };

  return (
    <VocabularyGoalsContext.Provider value={value}>
      {children}
    </VocabularyGoalsContext.Provider>
  );
};

export const useVocabularyGoals = () => {
  const context = useContext(VocabularyGoalsContext);
  if (!context) {
    throw new Error(
      "useVocabularyGoals must be used within a VocabularyGoalsProvider"
    );
  }
  return context;
};

export default VocabularyGoalsContext;
