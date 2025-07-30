// studentVocabularyProgressService.js
// Ported from migrate/lib/services/vocabulary_progress_service.dart
// Handles vocabulary progress logic and Firestore integration for students

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
const VOCABULARY_COLLECTION = "commonWords";

const studentVocabularyProgressService = {
  // Get user's vocabulary progress
  async getUserVocabularyProgress(userId) {
    try {
      // Ensure db is available
      if (!db) {
        throw new Error("Firebase database is not initialized");
      }

      const progressQuery = query(
        collection(db, PROGRESS_COLLECTION),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(progressQuery);
      const progressData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch word details for each progress record
      const progressWithWords = await Promise.all(
        progressData.map(async (progress) => {
          if (progress.wordId) {
            const wordRef = doc(db, VOCABULARY_COLLECTION, progress.wordId);
            const wordDoc = await getDoc(wordRef);

            if (wordDoc.exists()) {
              return {
                ...progress,
                word: wordDoc.data().word, // Add word field
              };
            }
          }
          return progress;
        })
      );

      return progressWithWords;
    } catch (error) {
      console.error("Error fetching vocabulary progress:", error);
      // Return empty array instead of throwing to prevent crashes
      return [];
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
      const progressDoc = snapshot.docs[0];
      const progressData = {
        id: progressDoc.id,
        ...progressDoc.data(),
      };

      // Fetch word details
      if (progressData.wordId) {
        const wordRef = doc(db, VOCABULARY_COLLECTION, progressData.wordId);
        const wordDoc = await getDoc(wordRef);

        if (wordDoc.exists()) {
          progressData.word = wordDoc.data().word; // Add word field
        }
      }

      return progressData;
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
          lastViewed: serverTimestamp(), // Add lastViewed field
          lastReviewed: serverTimestamp(),
          reviewCount: (existingProgress.reviewCount || 0) + 1,
          timesViewed: (existingProgress.timesViewed || 0) + 1, // Add timesViewed
          timesCorrect: (existingProgress.timesCorrect || 0) + 1, // Add timesCorrect
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
          lastViewed: serverTimestamp(), // Add lastViewed field
          lastReviewed: serverTimestamp(),
          reviewCount: 1,
          timesViewed: 1, // Add timesViewed
          timesCorrect: 1, // Add timesCorrect
          timesIncorrect: 0, // Add timesIncorrect
          isFavorite: false, // Add isFavorite
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
          lastViewed: serverTimestamp(), // Add lastViewed field
          lastReviewed: serverTimestamp(),
          reviewCount: (existingProgress.reviewCount || 0) + 1,
          timesViewed: (existingProgress.timesViewed || 0) + 1, // Add timesViewed
          timesIncorrect: (existingProgress.timesIncorrect || 0) + 1, // Add timesIncorrect
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
          lastViewed: serverTimestamp(), // Add lastViewed field
          lastReviewed: serverTimestamp(),
          reviewCount: 1,
          timesViewed: 1, // Add timesViewed
          timesCorrect: 0, // Add timesCorrect
          timesIncorrect: 1, // Add timesIncorrect
          isFavorite: false, // Add isFavorite
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
          lastViewed: serverTimestamp(), // Add lastViewed field
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
                lastViewed: progress.lastViewed, // Add lastViewed
                lastReviewed: progress.lastReviewed,
                reviewCount: progress.reviewCount,
                timesViewed: progress.timesViewed, // Add timesViewed
                timesCorrect: progress.timesCorrect, // Add timesCorrect
                timesIncorrect: progress.timesIncorrect, // Add timesIncorrect
              },
              word: {
                id: wordDoc.id,
                word: wordDoc.data().word, // Add word field
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
      console.log("🔄 Service toggleFavorite called:", {
        userId,
        wordId,
        isFavorite,
      });

      // Validate inputs
      if (!userId || !wordId) {
        throw new Error("Missing userId or wordId");
      }

      // Check if db is available
      if (!db) {
        throw new Error("Firebase database is not initialized");
      }

      const existingProgress = await this.getWordProgress(userId, wordId);
      console.log("📊 Existing progress:", existingProgress);

      if (existingProgress) {
        // Update existing record
        console.log("🔄 Updating existing progress record");
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        await updateDoc(progressRef, {
          isFavorite,
          lastViewed: serverTimestamp(), // Add lastViewed field
          updatedAt: serverTimestamp(),
        });

        console.log("✅ Existing record updated successfully");
        return {
          id: existingProgress.id,
          isFavorite,
        };
      } else {
        // Create new progress record
        console.log("🔄 Creating new progress record");
        const newProgress = {
          userId,
          wordId,
          isFavorite,
          status: "new",
          lastViewed: serverTimestamp(), // Add lastViewed field
          lastReviewed: serverTimestamp(),
          reviewCount: 0,
          timesViewed: 0, // Add timesViewed
          timesCorrect: 0, // Add timesCorrect
          timesIncorrect: 0, // Add timesIncorrect
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        console.log("📝 New progress data:", newProgress);
        const docRef = await addDoc(
          collection(db, PROGRESS_COLLECTION),
          newProgress
        );

        console.log("✅ New record created successfully:", docRef.id);
        return {
          id: docRef.id,
          ...newProgress,
        };
      }
    } catch (error) {
      console.error("❌ Error toggling favorite status:", error);
      console.error("🔍 Error details:", {
        userId,
        wordId,
        isFavorite,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      throw error;
    }
  },

  // Update word progress with attempt result
  async updateWordProgress(userId, wordId, isCorrect) {
    try {
      const existingProgress = await this.getWordProgress(userId, wordId);

      if (existingProgress) {
        // Update existing record
        const progressRef = doc(db, PROGRESS_COLLECTION, existingProgress.id);
        const updateData = {
          lastViewed: serverTimestamp(),
          timesViewed: (existingProgress.timesViewed || 0) + 1,
          updatedAt: serverTimestamp(),
        };

        if (isCorrect) {
          updateData.timesCorrect = (existingProgress.timesCorrect || 0) + 1;
        } else {
          updateData.timesIncorrect =
            (existingProgress.timesIncorrect || 0) + 1;
        }

        await updateDoc(progressRef, updateData);

        return {
          id: existingProgress.id,
          timesCorrect:
            updateData.timesCorrect || existingProgress.timesCorrect,
          timesIncorrect:
            updateData.timesIncorrect || existingProgress.timesIncorrect,
          timesViewed: updateData.timesViewed,
        };
      } else {
        // Create new progress record
        const newProgress = {
          userId,
          wordId,
          status: "new",
          lastViewed: serverTimestamp(),
          lastReviewed: serverTimestamp(),
          reviewCount: 0,
          timesViewed: 1,
          timesCorrect: isCorrect ? 1 : 0,
          timesIncorrect: isCorrect ? 0 : 1,
          isFavorite: false,
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
      console.error("Error updating word progress:", error);
      throw error;
    }
  },
};

export default studentVocabularyProgressService;
