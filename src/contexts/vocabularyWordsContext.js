import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import studentVocabularyService from "../services/student-services/studentVocabularyService";

const VocabularyWordsContext = createContext();

// Request deduplication cache
const requestCache = new Map();

export const VocabularyWordsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // State for vocabulary words
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Loading and error states
  const [loading, setLoading] = useState({
    words: false,
  });
  const [error, setError] = useState({
    words: null,
  });

  // Initialize vocabulary words when user changes
  useEffect(() => {
    if (userId) {
      fetchVocabularyWords();
    }
  }, [userId]);

  // Fetch vocabulary words with deduplication
  const fetchVocabularyWords = useCallback(
    async (filters = {}) => {
      // Create a cache key for request deduplication
      const cacheKey = `${userId}-${JSON.stringify(filters)}`;
      
      if (!userId) {
        return;
      }

      // Check if a request with the same parameters is already in progress
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }

      setLoading((prev) => ({ ...prev, words: true }));
      setError((prev) => ({ ...prev, words: null }));

      // Create and cache the request promise
      const requestPromise = (async () => {
        try {
           const words = await studentVocabularyService.getVocabularyWords({
             ...filters,
             userId,
           });
           setVocabularyWords(words);
           setCurrentWordIndex(0);
           return words;
        } catch (err) {
          console.error("❌ Error fetching vocabulary words:", err);
          setError((prev) => ({ ...prev, words: err.message }));
          throw err;
        } finally {
           setLoading((prev) => ({ ...prev, words: false }));
           // Remove from cache after completion
           requestCache.delete(cacheKey);
         }
      })();

      // Cache the promise
      requestCache.set(cacheKey, requestPromise);
      
      return requestPromise;
    },
    [userId]
  );

  // Navigation functions
  const setRandomWord = useCallback(() => {
    if (vocabularyWords.length === 0) return;

    const randomIndex = Math.floor(Math.random() * vocabularyWords.length);
    setCurrentWordIndex(randomIndex);
  }, [vocabularyWords.length]);

  const goToNextWord = useCallback(() => {
    if (currentWordIndex < vocabularyWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }, [currentWordIndex, vocabularyWords.length]);

  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  }, [currentWordIndex]);

  const goToFirstWord = useCallback(() => {
    setCurrentWordIndex(0);
  }, []);

  const goToLastWord = useCallback(() => {
    if (vocabularyWords.length > 0) {
      setCurrentWordIndex(vocabularyWords.length - 1);
    }
  }, [vocabularyWords.length]);

  // Get current word
  const currentWord = vocabularyWords[currentWordIndex] || null;

  // Navigation state
  const navigationState = {
    canGoNext: currentWordIndex < vocabularyWords.length - 1,
    canGoPrevious: currentWordIndex > 0,
    totalWords: vocabularyWords.length,
    currentIndex: currentWordIndex,
  };

  const value = {
    // Vocabulary words
    vocabularyWords,
    currentWord,
    currentWordIndex,
    setCurrentWordIndex,
    fetchVocabularyWords,

    // Navigation
    navigationState,
    setRandomWord,
    goToNextWord,
    goToPreviousWord,
    goToFirstWord,
    goToLastWord,

    // Loading and error states
    loading,
    error,
  };

  return (
    <VocabularyWordsContext.Provider value={value}>
      {children}
    </VocabularyWordsContext.Provider>
  );
};

export const useVocabularyWords = () => {
  const context = useContext(VocabularyWordsContext);
  if (!context) {
    throw new Error(
      "useVocabularyWords must be used within a VocabularyWordsProvider"
    );
  }
  return context;
};

export default VocabularyWordsContext;
