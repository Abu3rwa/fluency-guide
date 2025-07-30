// studentSpeechRecognitionService.js
// Enhanced speech recognition service with pronunciation analysis
// Ported from migrate/lib/services/speech_recognition_service.dart
// Handles speech recognition logic for students (browser Web Speech API)

import studentPronunciationProgressService from "./studentPronunciationProgressService";

class StudentSpeechRecognitionService {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.listeningStartTime = null;
    this.lastWords = "";
    this.confidence = 0.0;
  }

  /**
   * Check if speech recognition is supported
   * @returns {boolean} True if supported
   */
  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Request microphone permission
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestMicrophonePermission() {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: "microphone",
        });
        if (permission.state === "granted") {
          return true;
        }
        if (permission.state === "prompt") {
          // Try to get permission by starting recognition briefly
          const tempRecognition = this.createRecognition();
          return new Promise((resolve) => {
            tempRecognition.onstart = () => {
              tempRecognition.stop();
              resolve(true);
            };
            tempRecognition.onerror = () => {
              resolve(false);
            };
            tempRecognition.start();
          });
        }
      }
      return false;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      return false;
    }
  }

  /**
   * Create speech recognition instance
   * @returns {SpeechRecognition} Recognition instance
   */
  createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";

    return recognition;
  }

  /**
   * Start listening for speech
   * @param {Object} options - Recognition options
   * @returns {Promise<string>} Promise that resolves with transcript
   */
  startListening(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error("Speech recognition not supported in this browser."));
        return;
      }

      if (this.isListening) {
        reject(new Error("Already listening"));
        return;
      }

      this.recognition = this.createRecognition();
      this.isListening = true;
      this.listeningStartTime = new Date();
      this.lastWords = "";
      this.confidence = 0.0;

      this.recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      this.recognition.onresult = (event) => {
        const result = event.results[0];
        this.lastWords = result[0].transcript;
        this.confidence = result[0].confidence;
        console.log(
          "Recognized:",
          this.lastWords,
          "Confidence:",
          this.confidence
        );
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve(this.lastWords);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Remove punctuation from text for comparison
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  removePunctuation(text) {
    return text.replace(/[^\w\s]/g, "").trim();
  }

  /**
   * Compare pronunciation with target word
   * @param {string} targetWord - Target word to pronounce
   * @param {string} spokenWord - Spoken word
   * @returns {number} Similarity score (0.0 - 1.0)
   */
  comparePronunciation(targetWord, spokenWord) {
    if (!spokenWord || spokenWord.trim() === "") {
      return 0.0;
    }

    // Remove punctuation and convert to lowercase for comparison
    const target = this.removePunctuation(targetWord.toLowerCase());
    const spoken = this.removePunctuation(spokenWord.toLowerCase());

    console.log("Comparing pronunciation:");
    console.log("Original target:", targetWord);
    console.log("Original spoken:", spokenWord);
    console.log("Cleaned target:", target);
    console.log("Cleaned spoken:", spoken);

    // Exact match
    if (target === spoken) {
      return 1.0;
    }

    // Check if target word is contained in spoken words
    if (spoken.includes(target)) {
      return 0.9;
    }

    // Check if spoken word is contained in target
    if (target.includes(spoken)) {
      return 0.8;
    }

    // Calculate similarity using character matching
    let matches = 0;
    const totalLength = target.length;

    for (let i = 0; i < target.length && i < spoken.length; i++) {
      if (target[i] === spoken[i]) {
        matches++;
      }
    }

    // Add bonus for length similarity
    const lengthSimilarity =
      1.0 - Math.abs(target.length - spoken.length) / target.length;

    // Calculate final similarity
    const characterSimilarity = matches / totalLength;
    const finalSimilarity = characterSimilarity * 0.7 + lengthSimilarity * 0.3;

    console.log("Pronunciation comparison result:", finalSimilarity);
    return Math.max(0.0, Math.min(1.0, finalSimilarity));
  }

  /**
   * Calculate accuracy based on similarity and confidence
   * @param {string} targetWord - Target word
   * @param {string} spokenWord - Spoken word
   * @param {number} confidence - Speech recognition confidence
   * @returns {number} Accuracy score (0.0 - 1.0)
   */
  calculateAccuracy(targetWord, spokenWord, confidence) {
    const similarity = this.comparePronunciation(targetWord, spokenWord);

    // Weight similarity more heavily than confidence
    const accuracy = similarity * 0.8 + confidence * 0.2;

    return Math.max(0.0, Math.min(1.0, accuracy));
  }

  /**
   * Get pronunciation feedback
   * @param {string} targetWord - Target word
   * @param {string} spokenWord - Spoken word
   * @param {number} similarity - Similarity score
   * @returns {string} Feedback message
   */
  getPronunciationFeedback(targetWord, spokenWord, similarity) {
    if (!spokenWord || spokenWord.trim() === "") {
      return "Please speak the word clearly";
    }

    if (similarity >= 0.9) {
      return "Excellent pronunciation! 🎉";
    } else if (similarity >= 0.7) {
      return "Good pronunciation! Try to speak more clearly";
    } else if (similarity >= 0.5) {
      return "Fair pronunciation. Listen to the correct pronunciation and try again";
    } else {
      return "Try again. Listen to the correct pronunciation carefully";
    }
  }

  /**
   * Analyze mispronounced words
   * @param {string} targetWord - Target word
   * @param {string} spokenWord - Spoken word
   * @returns {Array<string>} Array of mispronounced words
   */
  analyzeMispronouncedWords(targetWord, spokenWord) {
    const target = this.removePunctuation(targetWord.toLowerCase());
    const spoken = this.removePunctuation(spokenWord.toLowerCase());

    if (target === spoken) {
      return [];
    }

    // Simple analysis - words that don't match
    const targetWords = target.split(" ");
    const spokenWords = spoken.split(" ");
    const mispronounced = [];

    for (const targetWord of targetWords) {
      if (!spokenWords.includes(targetWord)) {
        mispronounced.push(targetWord);
      }
    }

    return mispronounced;
  }

  /**
   * Get correct words from spoken text
   * @param {string} targetWord - Target word
   * @param {string} spokenWord - Spoken word
   * @returns {Array<string>} Array of correct words
   */
  getCorrectWords(targetWord, spokenWord) {
    const target = this.removePunctuation(targetWord.toLowerCase());
    const spoken = this.removePunctuation(spokenWord.toLowerCase());

    if (target === spoken) {
      return [target];
    }

    const targetWords = target.split(" ");
    const spokenWords = spoken.split(" ");
    const correct = [];

    for (const targetWord of targetWords) {
      if (spokenWords.includes(targetWord)) {
        correct.push(targetWord);
      }
    }

    return correct;
  }

  /**
   * Get confidence level description
   * @param {number} confidence - Confidence score
   * @returns {string} Confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.7) return "High";
    if (confidence >= 0.5) return "Medium";
    if (confidence >= 0.3) return "Low";
    return "Very Low";
  }

  /**
   * Get accuracy level description
   * @param {number} accuracy - Accuracy score
   * @returns {string} Accuracy level
   */
  getAccuracyLevel(accuracy) {
    if (accuracy >= 0.9) return "Excellent";
    if (accuracy >= 0.7) return "Good";
    if (accuracy >= 0.5) return "Fair";
    if (accuracy >= 0.3) return "Poor";
    return "Very Poor";
  }

  /**
   * Analyze pronunciation and create progress record
   * @param {string} userId - User ID
   * @param {string} targetWord - Target word
   * @param {string} spokenText - Spoken text
   * @param {number} confidence - Speech recognition confidence
   * @returns {Promise<Object>} Pronunciation progress object
   */
  async analyzePronunciation(userId, targetWord, spokenText, confidence) {
    const accuracy = this.calculateAccuracy(targetWord, spokenText, confidence);
    const similarity = this.comparePronunciation(targetWord, spokenText);
    const isCorrect = accuracy >= 0.8; // Threshold for correct pronunciation
    const mispronouncedWords = this.analyzeMispronouncedWords(
      targetWord,
      spokenText
    );
    const correctWords = this.getCorrectWords(targetWord, spokenText);
    const speakingDuration = this.listeningStartTime
      ? new Date() - this.listeningStartTime
      : 0;

    const progress = {
      userId,
      word: targetWord,
      spokenText,
      confidence,
      similarity,
      isCorrect,
      mispronouncedWords,
      correctWords,
      accuracy,
      timestamp: new Date(),
      speakingDuration,
      feedback: this.getPronunciationFeedback(
        targetWord,
        spokenText,
        similarity
      ),
      additionalMetrics: {
        targetWordLength: targetWord.length,
        spokenTextLength: spokenText.length,
        wordCount: spokenText.split(" ").length,
        confidenceLevel: this.getConfidenceLevel(confidence),
        accuracyLevel: this.getAccuracyLevel(accuracy),
      },
    };

    // Save to Firebase
    try {
      await studentPronunciationProgressService.savePronunciationProgress(
        progress
      );
      console.log("Pronunciation progress saved successfully");
    } catch (error) {
      console.error("Error saving pronunciation progress:", error);
    }

    return progress;
  }

  /**
   * Practice pronunciation with real-time feedback
   * @param {string} userId - User ID
   * @param {string} targetWord - Target word
   * @param {Object} options - Recognition options
   * @returns {Promise<Object>} Pronunciation result
   */
  async practicePronunciation(userId, targetWord, options = {}) {
    try {
      console.log("Starting pronunciation practice for:", targetWord);

      const spokenText = await this.startListening(options);
      const confidence = this.confidence;

      const result = await this.analyzePronunciation(
        userId,
        targetWord,
        spokenText,
        confidence
      );

      return result;
    } catch (error) {
      console.error("Error in pronunciation practice:", error);
      throw error;
    }
  }
}

// Create singleton instance
const studentSpeechRecognitionService = new StudentSpeechRecognitionService();

export default studentSpeechRecognitionService;
