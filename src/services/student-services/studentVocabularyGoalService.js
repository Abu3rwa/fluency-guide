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
      // Ensure db is available
      if (!db) {
        throw new Error("Firebase database is not initialized");
      }
      
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
      // Return null instead of throwing to prevent crashes
      return null;
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
