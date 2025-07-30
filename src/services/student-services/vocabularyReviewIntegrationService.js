// vocabularyReviewIntegrationService.js
// Integrates vocabulary building tasks with personalized review system
// Creates review items from vocabulary tasks and manages learning flow

import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import studentReviewService from "./studentReviewService";
import studentVocabularyService from "./studentVocabularyService";
import studentTaskService from "./studentTaskService";
import studentRecentActivityService from "./studentRecentActivityService";

class VocabularyReviewIntegrationService {
  constructor() {
    this.vocabularyReviewCollection = "vocabularyReviews";
  }

  /**
   * Create review items from vocabulary task completion
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @param {Object} taskResult - Task completion result
   * @returns {Promise<Array>} Array of created review items
   */
  async createReviewItemsFromVocabularyTask(userId, taskId, taskResult) {
    try {
      // Get task details
      const task = await studentTaskService.getTaskById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const reviewItems = [];

      // Extract vocabulary words from task
      const vocabularyWords = this.extractVocabularyFromTask(task);

      // Create review items for each vocabulary word
      for (const word of vocabularyWords) {
        const reviewItem = await studentReviewService.createReviewItem(
          userId,
          {
            id: word.id || word.word,
            word: word.word,
            definition: word.definition,
            example: word.example,
            difficulty: word.difficulty || this.calculateWordDifficulty(word),
            audioUrl: word.audioUrl,
            tags: word.tags || [],
            sourceTask: taskId,
            sourceLesson: task.lessonId,
            sourceCourse: task.courseId,
          },
          "vocabulary"
        );

        reviewItems.push(reviewItem);

        // Create recent activity for vocabulary learning
        await studentRecentActivityService.createActivityFromTaskAttempt(
          taskId,
          userId,
          word.id || word.word,
          `Learned vocabulary: ${word.word}`,
          task.lessonId,
          task.courseId,
          taskResult.isPassed ? "completed" : "inProgress",
          taskResult.score / 100,
          taskResult.score,
          taskResult.timeSpent,
          vocabularyWords.length
        );
      }

      // Update vocabulary progress
      await this.updateVocabularyProgress(userId, vocabularyWords, taskResult);

      return reviewItems;
    } catch (error) {
      console.error("Error creating review items from vocabulary task:", error);
      throw new Error("Failed to create review items from vocabulary task");
    }
  }

  /**
   * Extract vocabulary words from a task
   * @param {Object} task - Task object
   * @returns {Array} Array of vocabulary words
   */
  extractVocabularyFromTask(task) {
    const vocabularyWords = [];

    // Extract from task questions
    if (task.questions) {
      task.questions.forEach((question) => {
        // Extract vocabulary from question text
        const words = this.extractWordsFromText(question.text);
        words.forEach((word) => {
          if (!vocabularyWords.find((w) => w.word === word)) {
            vocabularyWords.push({
              word,
              source: "question",
              questionId: question.id,
            });
          }
        });

        // Extract from options (for multiple choice)
        if (question.options) {
          question.options.forEach((option) => {
            const optionWords = this.extractWordsFromText(option.text);
            optionWords.forEach((word) => {
              if (!vocabularyWords.find((w) => w.word === word)) {
                vocabularyWords.push({
                  word,
                  source: "option",
                  questionId: question.id,
                });
              }
            });
          });
        }
      });
    }

    // Extract from task vocabulary field
    if (task.vocabulary && Array.isArray(task.vocabulary)) {
      task.vocabulary.forEach((vocab) => {
        if (!vocabularyWords.find((w) => w.word === vocab.word)) {
          vocabularyWords.push({
            ...vocab,
            source: "task_vocabulary",
          });
        }
      });
    }

    return vocabularyWords;
  }

  /**
   * Extract potential vocabulary words from text
   * @param {string} text - Text to extract words from
   * @returns {Array} Array of potential vocabulary words
   */
  extractWordsFromText(text) {
    if (!text) return [];

    // Simple word extraction (can be enhanced with NLP)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3) // Filter out short words
      .filter((word) => !this.isCommonWord(word)); // Filter out common words

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check if a word is a common word (should be enhanced with a proper dictionary)
   * @param {string} word - Word to check
   * @returns {boolean} True if common word
   */
  isCommonWord(word) {
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "mine",
      "yours",
      "hers",
      "ours",
      "theirs",
      "what",
      "when",
      "where",
      "why",
      "how",
      "who",
      "which",
      "whom",
      "whose",
      "if",
      "then",
      "else",
      "while",
      "because",
      "since",
      "although",
      "though",
      "unless",
      "until",
      "before",
      "after",
      "during",
      "through",
      "between",
      "among",
      "within",
      "without",
      "against",
      "toward",
      "towards",
      "into",
      "onto",
      "upon",
      "above",
      "below",
      "under",
      "over",
      "across",
      "along",
      "around",
      "behind",
      "beneath",
      "beside",
      "beyond",
      "inside",
      "outside",
      "near",
      "far",
      "close",
      "distant",
      "high",
      "low",
      "up",
      "down",
      "left",
      "right",
      "front",
      "back",
      "top",
      "bottom",
      "middle",
      "center",
      "side",
      "end",
      "begin",
      "start",
      "stop",
      "finish",
      "complete",
      "done",
      "ready",
      "set",
      "go",
      "come",
      "get",
      "give",
      "take",
      "make",
      "let",
      "put",
      "say",
      "tell",
      "ask",
      "answer",
      "talk",
      "speak",
      "listen",
      "hear",
      "see",
      "look",
      "watch",
      "read",
      "write",
      "draw",
      "paint",
      "sing",
      "dance",
      "play",
      "work",
      "study",
      "learn",
      "teach",
      "help",
      "use",
      "find",
      "keep",
      "hold",
      "carry",
      "bring",
      "send",
      "give",
      "show",
      "hide",
      "open",
      "close",
      "start",
      "begin",
      "end",
      "finish",
      "complete",
      "stop",
      "wait",
      "stay",
      "leave",
      "arrive",
      "reach",
      "return",
      "come",
      "go",
      "walk",
      "run",
      "jump",
      "climb",
      "fall",
      "rise",
      "grow",
      "change",
      "move",
      "turn",
      "spin",
      "roll",
      "slide",
      "swim",
      "fly",
      "drive",
      "ride",
      "sit",
      "stand",
      "lie",
      "sleep",
      "wake",
      "eat",
      "drink",
      "cook",
      "clean",
      "wash",
      "dry",
      "wear",
      "dress",
      "undress",
      "buy",
      "sell",
      "pay",
      "cost",
      "spend",
      "save",
      "earn",
      "lose",
      "win",
      "beat",
      "hit",
      "catch",
      "throw",
      "kick",
      "punch",
      "push",
      "pull",
      "lift",
      "drop",
      "pick",
      "choose",
      "select",
      "decide",
      "think",
      "know",
      "understand",
      "remember",
      "forget",
      "believe",
      "hope",
      "wish",
      "want",
      "need",
      "like",
      "love",
      "hate",
      "enjoy",
      "prefer",
      "enjoy",
      "hate",
      "dislike",
      "enjoy",
      "like",
      "love",
      "hate",
      "dislike",
      "enjoy",
      "like",
      "love",
      "hate",
      "dislike",
      "enjoy",
      "like",
      "love",
      "hate",
      "dislike",
    ];

    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Calculate word difficulty based on various factors
   * @param {Object} word - Word object
   * @returns {number} Difficulty level (1-5)
   */
  calculateWordDifficulty(word) {
    let difficulty = 3; // Default medium difficulty

    // Adjust based on word length
    if (word.word.length <= 4) difficulty -= 1;
    else if (word.word.length >= 8) difficulty += 1;

    // Adjust based on frequency (if available)
    if (word.frequency) {
      if (word.frequency === "high") difficulty -= 1;
      else if (word.frequency === "low") difficulty += 1;
    }

    // Adjust based on complexity indicators
    if (word.word.includes("-") || word.word.includes("'")) difficulty += 1;
    if (word.word.match(/[A-Z]/)) difficulty += 1; // Contains uppercase

    return Math.max(1, Math.min(5, difficulty));
  }

  /**
   * Update vocabulary progress after task completion
   * @param {string} userId - User ID
   * @param {Array} vocabularyWords - Array of vocabulary words
   * @param {Object} taskResult - Task completion result
   */
  async updateVocabularyProgress(userId, vocabularyWords, taskResult) {
    try {
      for (const word of vocabularyWords) {
        // Update vocabulary progress
        await studentVocabularyService.updateVocabularyProgress(
          userId,
          word.word,
          {
            timesViewed: 1,
            timesCorrect: taskResult.isPassed ? 1 : 0,
            timesIncorrect: taskResult.isPassed ? 0 : 1,
            lastViewed: new Date(),
            isLearned: taskResult.isPassed,
          }
        );
      }
    } catch (error) {
      console.error("Error updating vocabulary progress:", error);
    }
  }

  /**
   * Get vocabulary-based review queue for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of vocabulary review items
   */
  async getVocabularyReviewQueue(userId) {
    try {
      const reviewQueue = await studentReviewService.getReviewQueue(userId);

      // Filter for vocabulary items only
      const vocabularyReviews = reviewQueue.filter(
        (item) => item.itemType === "vocabulary"
      );

      return vocabularyReviews;
    } catch (error) {
      console.error("Error getting vocabulary review queue:", error);
      return [];
    }
  }

  /**
   * Create vocabulary task from review items
   * @param {string} userId - User ID
   * @param {Array} reviewItems - Review items to create task from
   * @param {string} taskType - Type of task to create
   * @returns {Promise<Object>} Created task
   */
  async createVocabularyTaskFromReviews(
    userId,
    reviewItems,
    taskType = "multipleChoice"
  ) {
    try {
      const vocabularyWords = reviewItems.map((item) => item.contentData);

      // Generate questions based on vocabulary words
      const questions = this.generateVocabularyQuestions(
        vocabularyWords,
        taskType
      );

      const taskData = {
        title: `Vocabulary Review - ${taskType}`,
        description: `Review session for ${vocabularyWords.length} vocabulary words`,
        type: taskType,
        questions,
        vocabulary: vocabularyWords,
        difficulty: this.calculateAverageDifficulty(vocabularyWords),
        estimatedTime: vocabularyWords.length * 30, // 30 seconds per word
        passingScore: 70,
        lessonId: "vocabulary_review",
        courseId: "vocabulary_course",
        tags: ["vocabulary", "review", "spaced-repetition"],
        isVocabularyReview: true,
      };

      const task = await studentTaskService.createTask(taskData);

      return task;
    } catch (error) {
      console.error("Error creating vocabulary task from reviews:", error);
      throw new Error("Failed to create vocabulary task from reviews");
    }
  }

  /**
   * Generate vocabulary questions for different task types
   * @param {Array} vocabularyWords - Array of vocabulary words
   * @param {string} taskType - Type of task
   * @returns {Array} Array of questions
   */
  generateVocabularyQuestions(vocabularyWords, taskType) {
    const questions = [];

    switch (taskType) {
      case "multipleChoice":
        vocabularyWords.forEach((word, index) => {
          const question = {
            id: `vocab_${index}`,
            text: `What does "${word.word}" mean?`,
            type: "multipleChoice",
            points: 10,
            options: this.generateMultipleChoiceOptions(word),
            correctAnswer: word.definition,
          };
          questions.push(question);
        });
        break;

      case "fillInBlanks":
        vocabularyWords.forEach((word, index) => {
          const question = {
            id: `vocab_${index}`,
            text: `Complete the sentence: "${word.example.replace(
              word.word,
              "_____"
            )}"`,
            type: "fillInBlanks",
            points: 10,
            blanks: [
              {
                answer: word.word,
                hint: `Hint: ${word.definition}`,
              },
            ],
          };
          questions.push(question);
        });
        break;

      default:
        // Default to multiple choice
        return this.generateVocabularyQuestions(
          vocabularyWords,
          "multipleChoice"
        );
    }

    return questions;
  }

  /**
   * Generate multiple choice options for a vocabulary word
   * @param {Object} word - Vocabulary word
   * @returns {Array} Array of options
   */
  generateMultipleChoiceOptions(word) {
    const options = [
      {
        text: word.definition,
        isCorrect: true,
      },
    ];

    // Generate incorrect options (simplified - should use a proper vocabulary database)
    const incorrectOptions = [
      "A type of animal",
      "A color",
      "A feeling",
      "A place",
      "An action",
      "An object",
      "A time period",
      "A measurement",
    ];

    // Add 3 incorrect options
    for (let i = 0; i < 3; i++) {
      const randomOption =
        incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      if (!options.find((opt) => opt.text === randomOption)) {
        options.push({
          text: randomOption,
          isCorrect: false,
        });
      }
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * Calculate average difficulty of vocabulary words
   * @param {Array} vocabularyWords - Array of vocabulary words
   * @returns {number} Average difficulty
   */
  calculateAverageDifficulty(vocabularyWords) {
    if (vocabularyWords.length === 0) return 3;

    const totalDifficulty = vocabularyWords.reduce((sum, word) => {
      return sum + (word.difficulty || this.calculateWordDifficulty(word));
    }, 0);

    return Math.round(totalDifficulty / vocabularyWords.length);
  }

  /**
   * Get vocabulary learning analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Vocabulary learning analytics
   */
  async getVocabularyLearningAnalytics(userId) {
    try {
      const reviewQueue = await this.getVocabularyReviewQueue(userId);
      const vocabularyProgress =
        await studentVocabularyService.getVocabularyProgress(userId);

      const totalWords = vocabularyProgress.length;
      const learnedWords = vocabularyProgress.filter(
        (word) => word.isLearned
      ).length;
      const difficultWords = vocabularyProgress.filter(
        (word) => word.timesIncorrect > word.timesCorrect
      ).length;
      const wordsDueForReview = reviewQueue.length;

      return {
        totalWords,
        learnedWords,
        difficultWords,
        wordsDueForReview,
        learningProgress:
          totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
        reviewQueueSize: wordsDueForReview,
        averageAccuracy: this.calculateAverageAccuracy(vocabularyProgress),
      };
    } catch (error) {
      console.error("Error getting vocabulary learning analytics:", error);
      return {
        totalWords: 0,
        learnedWords: 0,
        difficultWords: 0,
        wordsDueForReview: 0,
        learningProgress: 0,
        reviewQueueSize: 0,
        averageAccuracy: 0,
      };
    }
  }

  /**
   * Calculate average accuracy from vocabulary progress
   * @param {Array} vocabularyProgress - Vocabulary progress data
   * @returns {number} Average accuracy percentage
   */
  calculateAverageAccuracy(vocabularyProgress) {
    if (vocabularyProgress.length === 0) return 0;

    const totalAccuracy = vocabularyProgress.reduce((sum, word) => {
      const totalAttempts = word.timesCorrect + word.timesIncorrect;
      if (totalAttempts === 0) return sum;
      return sum + (word.timesCorrect / totalAttempts) * 100;
    }, 0);

    return Math.round(totalAccuracy / vocabularyProgress.length);
  }
}

// Export singleton instance
const vocabularyReviewIntegrationService =
  new VocabularyReviewIntegrationService();
export default vocabularyReviewIntegrationService;
