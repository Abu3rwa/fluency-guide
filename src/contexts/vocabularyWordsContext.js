import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import studentVocabularyService from "../services/student-services/studentVocabularyService";

const VocabularyWordsContext = createContext();

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

  // Fetch vocabulary words
  const fetchVocabularyWords = useCallback(
    async (filters = {}) => {
      console.log("🔄 fetchVocabularyWords called with userId:", userId, "filters:", filters);
      
      if (!userId) {
        console.log("❌ No userId provided, skipping fetch");
        return;
      }

      setLoading((prev) => ({ ...prev, words: true }));
      setError((prev) => ({ ...prev, words: null }));

      try {
        console.log("📞 Calling studentVocabularyService.getVocabularyWords...");
        const words = await studentVocabularyService.getVocabularyWords({
          ...filters,
          userId,
        });
        console.log("📝 Received words from service:", words.length);
        console.log("📖 Sample word:", words[0]);
        setVocabularyWords(words);
        setCurrentWordIndex(0);
        console.log("✅ Vocabulary words updated in state");
      } catch (err) {
        console.error("❌ Error fetching vocabulary words:", err);
        setError((prev) => ({ ...prev, words: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, words: false }));
        console.log("🏁 Loading finished");
      }
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
