import { useState, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useStudentSpeechRecognition } from "../../../../contexts/studentSpeechRecognitionContext";

/**
 * Custom hook for pronunciation practice
 * Provides easy-to-use methods for speech recognition and pronunciation analysis
 */
export const usePronunciationPractice = () => {
  const { currentUser } = useAuth();
  const speechRecognition = useStudentSpeechRecognition();

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Start pronunciation practice for a word
   * @param {string} targetWord - The word to practice
   * @param {Object} options - Recognition options
   * @returns {Promise<Object>} Pronunciation result
   */
  const practiceWord = useCallback(
    async (targetWord, options = {}) => {
      if (!currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      if (!targetWord) {
        throw new Error("Target word is required");
      }

      try {
        setError(null);
        setIsListening(true);
        setSpokenText("");
        setPronunciationResult(null);
        setIsAnalyzing(true);

        // Check if speech recognition is supported
        if (!speechRecognition.isSupported()) {
          throw new Error(
            "Speech recognition is not supported in this browser."
          );
        }

        // Request microphone permission
        const hasPermission =
          await speechRecognition.requestMicrophonePermission();
        if (!hasPermission) {
          throw new Error(
            "Microphone permission is required for pronunciation practice."
          );
        }

        // Start pronunciation practice
        const result = await speechRecognition.practicePronunciation(
          currentUser.uid,
          targetWord,
          { lang: "en-US", ...options }
        );

        setSpokenText(result.spokenText);
        setPronunciationResult(result);

        return result;
      } catch (error) {
        console.error("Pronunciation practice error:", error);
        setError(error.message || "Failed to start pronunciation practice");
        throw error;
      } finally {
        setIsListening(false);
        setIsAnalyzing(false);
      }
    },
    [currentUser?.uid, speechRecognition]
  );

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    speechRecognition.stopListening();
    setIsListening(false);
  }, [speechRecognition]);

  /**
   * Reset the practice state
   */
  const reset = useCallback(() => {
    setSpokenText("");
    setPronunciationResult(null);
    setError(null);
    setIsListening(false);
    setIsAnalyzing(false);
  }, []);

  /**
   * Get feedback color based on accuracy
   * @param {number} accuracy - Accuracy score (0-1)
   * @returns {string} Color for feedback display
   */
  const getFeedbackColor = useCallback((accuracy) => {
    if (accuracy >= 0.8) return "success";
    if (accuracy >= 0.6) return "warning";
    return "error";
  }, []);

  /**
   * Get accuracy percentage
   * @param {number} accuracy - Accuracy score (0-1)
   * @returns {number} Accuracy percentage
   */
  const getAccuracyPercentage = useCallback((accuracy) => {
    return Math.round(accuracy * 100);
  }, []);

  /**
   * Check if pronunciation is correct
   * @param {number} accuracy - Accuracy score (0-1)
   * @returns {boolean} True if pronunciation is correct
   */
  const isCorrect = useCallback((accuracy) => {
    return accuracy >= 0.8;
  }, []);

  return {
    // State
    isListening,
    spokenText,
    pronunciationResult,
    error,
    isAnalyzing,

    // Methods
    practiceWord,
    stopListening,
    reset,

    // Utilities
    getFeedbackColor,
    getAccuracyPercentage,
    isCorrect,

    // Service access
    speechRecognition,
  };
};
