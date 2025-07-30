import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import studentVocabularyService from "../services/student-services/studentVocabularyService";
import studentVocabularyProgressService from "../services/student-services/studentVocabularyProgressService";
import studentVocabularyGoalService from "../services/student-services/studentVocabularyGoalService";
import {
  calculateProgressPercentage,
  isGoalCompleted,
} from "../student-ui/students-pages/student-vocabulary-building-page/utils/vocabularyHelpers";

const StudentVocabularyContext = createContext();

export const StudentVocabularyProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // State for vocabulary words
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // State for user progress
  const [userProgress, setUserProgress] = useState({});
  const [learnedCount, setLearnedCount] = useState(0);
  const [difficultWords, setDifficultWords] = useState([]);

  // State for goals
  const [activeGoal, setActiveGoal] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState({
    words: false,
    progress: false,
    goals: false,
  });
  const [error, setError] = useState({
    words: null,
    progress: null,
    goals: null,
  });

  // Fetch vocabulary words
  const fetchVocabularyWords = useCallback(
    async (filters = {}) => {
      if (!userId) return;

      setLoading((prev) => ({ ...prev, words: true }));
      setError((prev) => ({ ...prev, words: null }));

      try {
        const words = await studentVocabularyService.getVocabularyWords({
          ...filters,
          userId,
        });
        setVocabularyWords(words);
        setCurrentWordIndex(0);
      } catch (err) {
        console.error("Error fetching vocabulary words:", err);
        setError((prev) => ({ ...prev, words: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, words: false }));
      }
    },
    [userId]
  );

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    if (!userId) return;

    setLoading((prev) => ({ ...prev, progress: true }));
    setError((prev) => ({ ...prev, progress: null }));

    try {
      const progress =
        await studentVocabularyProgressService.getUserVocabularyProgress(
          userId
        );

      // Convert array to map for easier lookup
      const progressMap = {};
      progress.forEach((item) => {
        progressMap[item.wordId] = item;
      });

      setUserProgress(progressMap);

      // Update learned count
      const learnedCount =
        await studentVocabularyProgressService.getLearnedWordsCount(userId);
      setLearnedCount(learnedCount);

      // Fetch difficult words
      const difficultWords =
        await studentVocabularyProgressService.getDifficultWords(userId);
      setDifficultWords(difficultWords);
    } catch (err) {
      console.error("Error fetching user progress:", err);
      setError((prev) => ({ ...prev, progress: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, progress: false }));
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

  // Initialize data
  useEffect(() => {
    if (userId) {
      fetchVocabularyWords();
      fetchUserProgress();
      fetchActiveGoal();
    }
  }, [userId, fetchVocabularyWords, fetchUserProgress, fetchActiveGoal]);

  // Mark word as learned
  const markWordAsLearned = async (wordId) => {
    if (!userId || !wordId) return;

    try {
      await studentVocabularyProgressService.markWordAsLearned(userId, wordId);

      // Update progress in state
      await fetchUserProgress();

      // Update goal progress if there's an active goal
      if (activeGoal) {
        const result = await studentVocabularyGoalService.updateGoalProgress(
          activeGoal.id,
          1
        );

        // If goal is now completed, show celebration
        if (
          result.isCompleted &&
          !isGoalCompleted(activeGoal.currentProgress, activeGoal.dailyTarget)
        ) {
          // Update active goal in state
          await fetchActiveGoal();
          return true; // Return true to indicate goal completion
        }

        // Update active goal in state
        await fetchActiveGoal();
      }

      return false; // No goal completion
    } catch (err) {
      console.error("Error marking word as learned:", err);
      throw err;
    }
  };

  // Mark word as difficult
  const markWordAsDifficult = async (wordId) => {
    if (!userId || !wordId) return;

    try {
      await studentVocabularyProgressService.markWordAsDifficult(
        userId,
        wordId
      );

      // Update progress in state
      await fetchUserProgress();
    } catch (err) {
      console.error("Error marking word as difficult:", err);
      throw err;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (wordId) => {
    if (!userId || !wordId) {
      console.error("❌ Missing required data for toggleFavorite:", { userId, wordId });
      throw new Error("Missing user ID or word ID");
    }

    try {
      console.log("🔄 Context toggleFavorite called with:", { userId, wordId });
      
      const currentProgress = userProgress[wordId];
      const isFavorite = currentProgress?.isFavorite || false;
      
      console.log("📊 Current progress data:", { currentProgress, isFavorite });

      await studentVocabularyProgressService.toggleFavorite(
        userId,
        wordId,
        !isFavorite
      );

      console.log("✅ Service call successful, updating progress...");

      // Update progress in state
      await fetchUserProgress();
      
      console.log("✅ Progress updated successfully");
    } catch (err) {
      console.error("❌ Error toggling favorite status:", err);
      console.error("🔍 Error context:", { userId, wordId, userProgress: !!userProgress });
      throw err;
    }
  };

  // Create vocabulary goal
  const createVocabularyGoal = async (goalData) => {
    if (!userId) return;

    try {
      await studentVocabularyGoalService.createVocabularyGoal(userId, goalData);

      // Update goal in state
      await fetchActiveGoal();
    } catch (err) {
      console.error("Error creating vocabulary goal:", err);
      throw err;
    }
  };

  // Get word progress
  const getWordProgress = (wordId) => {
    return userProgress[wordId] || null;
  };

  // Set random word
  const setRandomWord = () => {
    if (vocabularyWords.length === 0) return;

    const randomIndex = Math.floor(Math.random() * vocabularyWords.length);
    setCurrentWordIndex(randomIndex);
  };

  // Calculate progress percentage for active goal
  const progressPercentage = activeGoal
    ? calculateProgressPercentage(
        activeGoal.currentProgress,
        activeGoal.dailyTarget
      )
    : 0;

  // Check if goal is completed
  const goalCompleted = activeGoal
    ? isGoalCompleted(activeGoal.currentProgress, activeGoal.dailyTarget)
    : false;

  const value = {
    // Vocabulary words
    vocabularyWords,
    currentWordIndex,
    setCurrentWordIndex,
    fetchVocabularyWords,

    // Progress
    userProgress,
    learnedCount,
    difficultWords,
    getWordProgress,
    markWordAsLearned,
    markWordAsDifficult,
    toggleFavorite,

    // Goals
    activeGoal,
    createVocabularyGoal,
    progressPercentage,
    goalCompleted,

    // Navigation
    setRandomWord,

    // Loading and error states
    loading,
    error,
  };

  return (
    <StudentVocabularyContext.Provider value={value}>
      {children}
    </StudentVocabularyContext.Provider>
  );
};

export const useStudentVocabulary = () => {
  const context = useContext(StudentVocabularyContext);
  if (!context) {
    throw new Error(
      "useStudentVocabulary must be used within a StudentVocabularyProvider"
    );
  }
  return context;
};

export default StudentVocabularyContext;
