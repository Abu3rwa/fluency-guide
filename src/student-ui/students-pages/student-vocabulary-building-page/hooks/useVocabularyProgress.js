import { useState, useEffect, useCallback } from "react";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";

const useVocabularyProgress = () => {
  const {
    vocabularyWords,
    userProgress,
    learnedCount,
    difficultWords,
    loading,
    error,
  } = useStudentVocabulary();

  const [stats, setStats] = useState({
    totalWords: 0,
    learnedWords: 0,
    difficultWords: 0,
    newWords: 0,
    learningRate: 0,
    averageReviews: 0,
    favoriteWords: 0,
  });

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const totalWords = vocabularyWords.length;
    const learnedWords = learnedCount;
    const difficultWordsCount = difficultWords.length;
    const newWords = totalWords - learnedWords - difficultWordsCount;

    const learningRate = totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;

    // Calculate average reviews
    const progressEntries = Object.values(userProgress);
    const totalReviews = progressEntries.reduce(
      (sum, entry) => sum + (entry.reviewCount || 0),
      0
    );
    const averageReviews =
      progressEntries.length > 0 ? totalReviews / progressEntries.length : 0;

    // Count favorite words
    const favoriteWords = progressEntries.filter(
      (entry) => entry.isFavorite
    ).length;

    setStats({
      totalWords,
      learnedWords,
      difficultWords: difficultWordsCount,
      newWords,
      learningRate,
      averageReviews: Math.round(averageReviews * 10) / 10,
      favoriteWords,
    });
  }, [vocabularyWords, learnedCount, difficultWords, userProgress]);

  // Update stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Get word status
  const getWordStatus = useCallback(
    (wordId) => {
      const progress = userProgress[wordId];
      if (!progress) return "new";
      return progress.status || "new";
    },
    [userProgress]
  );

  // Get words by status
  const getWordsByStatus = useCallback(
    (status) => {
      return vocabularyWords.filter(
        (word) => getWordStatus(word.id) === status
      );
    },
    [vocabularyWords, getWordStatus]
  );

  // Get learning streak
  const getLearningStreak = useCallback(() => {
    // This would need to be implemented based on your data structure
    // For now, return a placeholder
    return 0;
  }, []);

  // Get weekly progress
  const getWeeklyProgress = useCallback(() => {
    // This would need to be implemented based on your data structure
    // For now, return a placeholder
    return {
      wordsLearned: 0,
      daysActive: 0,
      averagePerDay: 0,
    };
  }, []);

  // Check if word is favorite
  const isWordFavorite = useCallback(
    (wordId) => {
      const progress = userProgress[wordId];
      return progress?.isFavorite || false;
    },
    [userProgress]
  );

  // Get review count for word
  const getWordReviewCount = useCallback(
    (wordId) => {
      const progress = userProgress[wordId];
      return progress?.reviewCount || 0;
    },
    [userProgress]
  );

  // Get last reviewed date for word
  const getWordLastReviewed = useCallback(
    (wordId) => {
      const progress = userProgress[wordId];
      return progress?.lastReviewed || null;
    },
    [userProgress]
  );

  // Get words that need review (difficult words)
  const getWordsNeedingReview = useCallback(() => {
    return difficultWords.map((item) => item.word);
  }, [difficultWords]);

  // Get recently learned words
  const getRecentlyLearnedWords = useCallback(
    (limit = 10) => {
      const learnedProgress = Object.values(userProgress)
        .filter((entry) => entry.status === "learned")
        .sort((a, b) => {
          const dateA = a.lastReviewed?.toDate?.() || new Date(a.lastReviewed);
          const dateB = b.lastReviewed?.toDate?.() || new Date(b.lastReviewed);
          return dateB - dateA;
        })
        .slice(0, limit);

      return learnedProgress
        .map((entry) => {
          const word = vocabularyWords.find((w) => w.id === entry.wordId);
          return word ? { ...word, progress: entry } : null;
        })
        .filter(Boolean);
    },
    [userProgress, vocabularyWords]
  );

  // Get favorite words
  const getFavoriteWords = useCallback(() => {
    const favoriteProgress = Object.values(userProgress).filter(
      (entry) => entry.isFavorite
    );

    return favoriteProgress
      .map((entry) => {
        const word = vocabularyWords.find((w) => w.id === entry.wordId);
        return word ? { ...word, progress: entry } : null;
      })
      .filter(Boolean);
  }, [userProgress, vocabularyWords]);

  return {
    // Statistics
    stats,

    // Word status and filtering
    getWordStatus,
    getWordsByStatus,
    isWordFavorite,
    getWordReviewCount,
    getWordLastReviewed,

    // Progress tracking
    getLearningStreak,
    getWeeklyProgress,

    // Word collections
    getWordsNeedingReview,
    getRecentlyLearnedWords,
    getFavoriteWords,

    // Loading and error states
    loading,
    error,
  };
};

export default useVocabularyProgress;
