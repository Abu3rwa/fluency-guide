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
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
