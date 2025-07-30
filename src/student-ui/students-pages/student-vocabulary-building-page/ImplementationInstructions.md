# Implementation Instructions for Student Vocabulary Building Feature

This document provides detailed instructions for implementing the Student Vocabulary Building feature in the React application. Follow these steps to create a complete, functional vocabulary building experience that matches the original Flutter implementation.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Service Implementation](#service-implementation)
3. [Context Implementation](#context-implementation)
4. [Component Implementation](#component-implementation)
5. [Styling and Responsive Design](#styling-and-responsive-design)
6. [Testing and Validation](#testing-and-validation)

## Getting Started

1. Create the folder structure as outlined in the `StudentVocabularyBuildingPage.md` document:

   ```
   src/
   └── student-ui/
       └── students-pages/
           └── student-vocabulary-building-page/
               ├── StudentVocabularyBuildingPage.jsx
               ├── components/
               │   ├── StudentVocabularyAppBar.jsx
               │   ├── StudentVocabularyGoalSection.jsx
               │   ├── StudentVocabularyProgressSection.jsx
               │   ├── StudentVocabularyWordCard.jsx
               │   ├── StudentVocabularyNavigationControls.jsx
               │   └── dialogs/
               │       ├── StudentGoalCompletedDialog.jsx
               │       ├── StudentMotivationDialog.jsx
               │       └── StudentPronunciationDialog.jsx
               ├── hooks/
               │   └── useVocabularyProgress.js
               ├── utils/
               │   └── vocabularyHelpers.js
               └── styles/
                   └── vocabularyStyles.js
   ```

2. Implement the services first, then the context provider, and finally the UI components. This ensures that the data layer is ready before building the UI.

## Service Implementation

### 1. Create `studentVocabularyService.js`

Create the file `src/services/student-services/studentVocabularyService.js`:

```javascript
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION_NAME = "vocabulary";

const studentVocabularyService = {
  // Get vocabulary words with optional filtering
  async getVocabularyWords(filters = {}) {
    try {
      const {
        level,
        category,
        limit: resultLimit,
        favoritesOnly,
        userId,
      } = filters;
      let vocabularyQuery = collection(db, COLLECTION_NAME);

      // Build query with filters
      const conditions = [];
      if (level) conditions.push(where("level", "==", level));
      if (category) conditions.push(where("category", "==", category));

      // Apply conditions and ordering
      vocabularyQuery = query(
        vocabularyQuery,
        ...conditions,
        orderBy("difficulty", "asc"),
        resultLimit ? limit(resultLimit) : null
      ).filter(Boolean); // Remove null values

      const snapshot = await getDocs(vocabularyQuery);
      let words = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // If favoritesOnly is true and userId is provided, filter for favorites
      if (favoritesOnly && userId) {
        // Get user's favorite words
        const progressRef = collection(db, "vocabularyProgress");
        const favoritesQuery = query(
          progressRef,
          where("userId", "==", userId),
          where("isFavorite", "==", true)
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoriteWordIds = favoritesSnapshot.docs.map(
          (doc) => doc.data().wordId
        );

        // Filter words to only include favorites
        words = words.filter((word) => favoriteWordIds.includes(word.id));
      }

      return words;
    } catch (error) {
      console.error("Error fetching vocabulary words:", error);
      throw error;
    }
  },

  // Get a single vocabulary word by ID
  async getVocabularyWordById(wordId) {
    try {
      const wordRef = doc(db, COLLECTION_NAME, wordId);
      const wordDoc = await getDoc(wordRef);

      if (!wordDoc.exists()) {
        throw new Error("Vocabulary word not found");
      }

      return {
        id: wordDoc.id,
        ...wordDoc.data(),
      };
    } catch (error) {
      console.error("Error fetching vocabulary word:", error);
      throw error;
    }
  },

  // Search vocabulary words
  async searchVocabularyWords(searchTerm) {
    try {
      // Firestore doesn't support native text search, so we'll fetch and filter
      // In a production app, consider using Algolia or another search service
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const words = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Simple client-side search
      return words.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching vocabulary words:", error);
      throw error;
    }
  },

  // Add a new vocabulary word (admin function)
  async addVocabularyWord(wordData) {
    try {
      const newWord = {
        ...wordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newWord);
      return {
        id: docRef.id,
        ...newWord,
      };
    } catch (error) {
      console.error("Error adding vocabulary word:", error);
      throw error;
    }
  },

  // Update a vocabulary word (admin function)
  async updateVocabularyWord(wordId, wordData) {
    try {
      const wordRef = doc(db, COLLECTION_NAME, wordId);
      const updateData = {
        ...wordData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(wordRef, updateData);
      return {
        id: wordId,
        ...updateData,
      };
    } catch (error) {
      console.error("Error updating vocabulary word:", error);
      throw error;
    }
  },
};

export default studentVocabularyService;
```

### 2. Create `studentVocabularyProgressService.js`

Create the file `src/services/student-services/studentVocabularyProgressService.js`:

```javascript
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const PROGRESS_COLLECTION = "vocabularyProgress";
const VOCABULARY_COLLECTION = "vocabulary";

const studentVocabularyProgressService = {
  // Get user's vocabulary progress
  async getUserVocabularyProgress(userId) {
    try {
      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching vocabulary progress:", error);
      throw error;
    }
  },

  // Get progress for a specific word
  async getWordProgress(userId, wordId) {
    try {
      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId),
        where("wordId", "==", wordId)
      );

      const snapshot = await getDocs(progressQuery);
      if (snapshot.empty) {
        return null;
      }

      // Should only be one document
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error fetching word progress:", error);
      throw error;
    }
  },

  // Mark a word as learned
  async markWordAsLearned(userId, wordId) {
    try {
      // Check if progress record exists
      const existingProgress = await this.getWordProgress(userId, wordId);

      if (existingProgress) {
        // Update existing record
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(progressRef, {
          status: "learned",
          lastReviewed: serverTimestamp(),
          reviewCount: (existingProgress.reviewCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });

        return {
          id: existingProgress.id,
          status: "learned",
        };
      } else {
        // Create new progress record
        const newProgress = {
          userId,
          wordId,
          status: "learned",
          lastReviewed: serverTimestamp(),
          reviewCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, PROGRESS_COLLECTION),
          newProgress
        );
        return {
          id: docRef.id,
          ...newProgress,
        };
      }
    } catch (error) {
      console.error("Error marking word as learned:", error);
      throw error;
    }
  },

  // Mark a word as difficult
  async markWordAsDifficult(userId, wordId) {
    try {
      // Check if progress record exists
      const existingProgress = await this.getWordProgress(userId, wordId);

      if (existingProgress) {
        // Update existing record
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(progressRef, {
          status: "difficult",
          lastReviewed: serverTimestamp(),
          reviewCount: (existingProgress.reviewCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });

        return {
          id: existingProgress.id,
          status: "difficult",
        };
      } else {
        // Create new progress record
        const newProgress = {
          userId,
          wordId,
          status: "difficult",
          lastReviewed: serverTimestamp(),
          reviewCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, PROGRESS_COLLECTION),
          newProgress
        );
        return {
          id: docRef.id,
          ...newProgress,
        };
      }
    } catch (error) {
      console.error("Error marking word as difficult:", error);
      throw error;
    }
  },

  // Reset word progress (mark as new)
  async resetWordProgress(userId, wordId) {
    try {
      // Check if progress record exists
      const existingProgress = await this.getWordProgress(userId, wordId);

      if (existingProgress) {
        // Update existing record
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(progressRef, {
          status: "new",
          lastReviewed: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return {
          id: existingProgress.id,
          status: "new",
        };
      }

      return null; // No progress to reset
    } catch (error) {
      console.error("Error resetting word progress:", error);
      throw error;
    }
  },

  // Get count of learned words
  async getLearnedWordsCount(userId) {
    try {
      const learnedQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId),
        where("status", "==", "learned")
      );

      const snapshot = await getDocs(learnedQuery);
      return snapshot.size;
    } catch (error) {
      console.error("Error counting learned words:", error);
      throw error;
    }
  },

  // Get difficult words with their details
  async getDifficultWords(userId) {
    try {
      const difficultQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId),
        where("status", "==", "difficult")
      );

      const snapshot = await getDocs(difficultQuery);
      const difficultProgress = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch the actual word details for each difficult word
      const difficultWords = await Promise.all(
        difficultProgress.map(async (progress) => {
          const wordRef = doc(db, VOCABULARY_COLLECTION, progress.wordId);
          const wordDoc = await getDoc(wordRef);

          if (wordDoc.exists()) {
            return {
              progress: {
                id: progress.id,
                lastReviewed: progress.lastReviewed,
                reviewCount: progress.reviewCount,
              },
              word: {
                id: wordDoc.id,
                ...wordDoc.data(),
              },
            };
          }

          return null;
        })
      );

      return difficultWords.filter(Boolean); // Remove any null values
    } catch (error) {
      console.error("Error fetching difficult words:", error);
      throw error;
    }
  },

  // Toggle favorite status for a word
  async toggleFavorite(userId, wordId, isFavorite) {
    try {
      const existingProgress = await this.getWordProgress(userId, wordId);

      if (existingProgress) {
        // Update existing record
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(progressRef, {
          isFavorite,
          updatedAt: serverTimestamp(),
        });

        return {
          id: existingProgress.id,
          isFavorite,
        };
      } else {
        // Create new progress record
        const newProgress = {
          userId,
          wordId,
          isFavorite,
          status: "new",
          lastReviewed: serverTimestamp(),
          reviewCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
          collection(db, PROGRESS_COLLECTION),
          newProgress
        );
        return {
          id: docRef.id,
          ...newProgress,
        };
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      throw error;
    }
  },
};

export default studentVocabularyProgressService;
```

### 3. Create `studentVocabularyGoalService.js`

Create the file `src/services/student-services/studentVocabularyGoalService.js`:

```javascript
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const GOALS_COLLECTION = "vocabularyGoals";

const studentVocabularyGoalService = {
  // Get user's vocabulary goals
  async getUserVocabularyGoals(userId) {
    try {
      const goalsQuery = query(
        collection(db, GOALS_COLLECTION),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(goalsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching vocabulary goals:", error);
      throw error;
    }
  },

  // Get active (incomplete) goals
  async getActiveVocabularyGoal(userId) {
    try {
      const goalsQuery = query(
        collection(db, GOALS_COLLECTION),
        where("userId", "==", userId),
        where("isActive", "==", true)
      );

      const snapshot = await getDocs(goalsQuery);
      if (snapshot.empty) {
        return null;
      }

      // Return the first active goal (there should only be one)
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error fetching active vocabulary goal:", error);
      throw error;
    }
  },

  // Create a new vocabulary goal
  async createVocabularyGoal(userId, goalData) {
    try {
      // First, deactivate any existing active goals
      const activeGoal = await this.getActiveVocabularyGoal(userId);
      if (activeGoal) {
        await this.updateVocabularyGoal(activeGoal.id, { isActive: false });
      }

      // Create new goal
      const newGoal = {
        userId,
        dailyTarget: goalData.dailyTarget,
        currentProgress: 0,
        lastUpdated: serverTimestamp(),
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, GOALS_COLLECTION), newGoal);
      return {
        id: docRef.id,
        ...newGoal,
      };
    } catch (error) {
      console.error("Error creating vocabulary goal:", error);
      throw error;
    }
  },

  // Update a vocabulary goal
  async updateVocabularyGoal(goalId, goalData) {
    try {
      const goalRef = doc(db, GOALS_COLLECTION, goalId);
      const updateData = {
        ...goalData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(goalRef, updateData);
      return {
        id: goalId,
        ...updateData,
      };
    } catch (error) {
      console.error("Error updating vocabulary goal:", error);
      throw error;
    }
  },

  // Update goal progress
  async updateGoalProgress(goalId, progress) {
    try {
      const goalRef = doc(db, GOALS_COLLECTION, goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }

      const goalData = goalDoc.data();
      const newProgress = goalData.currentProgress + progress;
      const isCompleted = newProgress >= goalData.dailyTarget;

      await updateDoc(goalRef, {
        currentProgress: newProgress,
        lastUpdated: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: goalId,
        currentProgress: newProgress,
        isCompleted,
      };
    } catch (error) {
      console.error("Error updating goal progress:", error);
      throw error;
    }
  },

  // Delete a vocabulary goal
  async deleteVocabularyGoal(goalId) {
    try {
      const goalRef = doc(db, GOALS_COLLECTION, goalId);
      await deleteDoc(goalRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting vocabulary goal:", error);
      throw error;
    }
  },
};

export default studentVocabularyGoalService;
```

### 4. Create Helper Functions

Create the file `src/student-ui/students-pages/student-vocabulary-building-page/utils/vocabularyHelpers.js`:

```javascript
// Get color for difficulty level
export const getDifficultyColor = (level) => {
  switch (level.toUpperCase()) {
    case "A1":
      return "#4CAF50"; // Green
    case "A2":
      return "#8BC34A"; // Light Green
    case "B1":
      return "#FF9800"; // Orange
    case "B2":
      return "#FF5722"; // Deep Orange
    case "C1":
      return "#F44336"; // Red
    case "C2":
      return "#9C27B0"; // Purple
    default:
      return "#9E9E9E"; // Grey
  }
};

// Get description for frequency
export const getFrequencyDescription = (frequency) => {
  switch (frequency.toLowerCase()) {
    case "very_high":
      return "Very commonly used in everyday English";
    case "high":
      return "Frequently used in English";
    case "medium":
      return "Moderately used in English";
    case "low":
      return "Occasionally used in English";
    case "very_low":
      return "Rarely used in English";
    default:
      return frequency;
  }
};

// Get motivational messages
export const getRandomMotivationalMessage = () => {
  const messages = [
    "Great job! Keep up the good work!",
    "You're making excellent progress!",
    "Your vocabulary is growing every day!",
    "Consistency is key to language learning!",
    "You're on your way to fluency!",
    "Every word you learn brings you closer to mastery!",
    "Learning vocabulary is like building a bridge to a new culture!",
    "Your dedication is impressive!",
    "You're developing a rich vocabulary!",
    "Keep going! You're doing great!",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

// Calculate progress percentage
export const calculateProgressPercentage = (current, target) => {
  if (!target || target <= 0) return 0;
  const percentage = current / target;
  return Math.min(1, Math.max(0, percentage)); // Clamp between 0 and 1
};

// Check if goal is completed
export const isGoalCompleted = (current, target) => {
  return current >= target;
};
```

## Context Implementation

### Create `studentVocabularyContext.js`

Create the file `src/contexts/studentVocabularyContext.js`:

```javascript
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
    if (!userId || !wordId) return;

    try {
      const currentProgress = userProgress[wordId];
      const isFavorite = currentProgress?.isFavorite || false;

      await studentVocabularyProgressService.toggleFavorite(
        userId,
        wordId,
        !isFavorite
      );

      // Update progress in state
      await fetchUserProgress();
    } catch (err) {
      console.error("Error toggling favorite status:", err);
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
```

## Component Implementation

Now implement the UI components following the structure and code examples provided in the `StudentVocabularyBuildingPage.md` document. Start with the main container component and then implement the child components.

### Implementation Order

1. First, implement the helper components:

   - `StudentVocabularyAppBar.jsx`
   - `StudentVocabularyProgressSection.jsx`
   - `StudentVocabularyNavigationControls.jsx`

2. Then implement the dialog components:
   - `StudentGoalComp
