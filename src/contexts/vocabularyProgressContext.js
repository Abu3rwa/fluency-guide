import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import studentVocabularyProgressService from "../services/student-services/studentVocabularyProgressService";

const VocabularyProgressContext = createContext();

export const VocabularyProgressProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // State for user progress
  const [userProgress, setUserProgress] = useState({});
  const [learnedCount, setLearnedCount] = useState(0);
  const [difficultWords, setDifficultWords] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState({
    progress: false,
  });
  const [error, setError] = useState({
    progress: null,
  });

  // Initialize progress when user changes
  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    }
  }, [userId]);

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

  // Mark word as learned
  const markWordAsLearned = useCallback(
    async (wordId) => {
      if (!userId || !wordId) return;

      try {
        await studentVocabularyProgressService.markWordAsLearned(
          userId,
          wordId
        );
        await fetchUserProgress();
      } catch (err) {
        console.error("Error marking word as learned:", err);
        throw err;
      }
    },
    [userId, fetchUserProgress]
  );

  // Mark word as difficult
  const markWordAsDifficult = useCallback(
    async (wordId) => {
      if (!userId || !wordId) return;

      try {
        await studentVocabularyProgressService.markWordAsDifficult(
          userId,
          wordId
        );
        await fetchUserProgress();
      } catch (err) {
        console.error("Error marking word as difficult:", err);
        throw err;
      }
    },
    [userId, fetchUserProgress]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (wordId) => {
      if (!userId || !wordId) return;

      try {
        const currentProgress = userProgress[wordId];
        const isFavorite = currentProgress?.isFavorite || false;

        await studentVocabularyProgressService.toggleFavorite(
          userId,
          wordId,
          !isFavorite
        );
        await fetchUserProgress();
      } catch (err) {
        console.error("Error toggling favorite status:", err);
        throw err;
      }
    },
    [userId, userProgress, fetchUserProgress]
  );

  // Get word progress
  const getWordProgress = useCallback(
    (wordId) => {
      return userProgress[wordId] || null;
    },
    [userProgress]
  );

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    const totalWords = Object.keys(userProgress).length;
    const learnedWords = Object.values(userProgress).filter(
      (progress) => progress.status === "learned"
    ).length;
    const difficultWordsCount = Object.values(userProgress).filter(
      (progress) => progress.status === "difficult"
    ).length;
    const favoriteWords = Object.values(userProgress).filter(
      (progress) => progress.isFavorite
    ).length;

    return {
      totalWords,
      learnedWords,
      difficultWordsCount,
      favoriteWords,
      learningRate: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
    };
  }, [userProgress]);

  const value = {
    // Progress data
    userProgress,
    learnedCount,
    difficultWords,
    getWordProgress,
    getProgressStats,

    // Actions
    fetchUserProgress,
    markWordAsLearned,
    markWordAsDifficult,
    toggleFavorite,

    // Loading and error states
    loading,
    error,
  };

  return (
    <VocabularyProgressContext.Provider value={value}>
      {children}
    </VocabularyProgressContext.Provider>
  );
};

export const useVocabularyProgress = () => {
  const context = useContext(VocabularyProgressContext);
  if (!context) {
    throw new Error(
      "useVocabularyProgress must be used within a VocabularyProgressProvider"
    );
  }
  return context;
};

export default VocabularyProgressContext;
