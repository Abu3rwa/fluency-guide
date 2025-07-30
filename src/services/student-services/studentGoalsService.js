import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  runTransaction,
} from "firebase/firestore";

/**
 * Comprehensive Goal Management Service
 * Handles all goal-related operations including creation, updates, progress tracking, and analytics
 */
class StudentGoalsService {
  constructor() {
    this.goalsCollection = "goals";
    this.userGoalsCollection = "userGoals";
    this.goalProgressCollection = "goalProgress";
  }

  /**
   * Get all goals for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of user goals
   */
  async getUserGoals(userId) {
    try {
      const goalsRef = collection(db, "users", userId, "goals");
      const goalsSnapshot = await getDocs(goalsRef);

      const goals = goalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      }));

      return goals;
    } catch (error) {
      console.error("Error fetching user goals:", error);
      throw new Error("Failed to fetch user goals");
    }
  }

  /**
   * Create a new goal
   * @param {string} userId - User ID
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  async createGoal(userId, goalData) {
    try {
      const goalsRef = collection(db, "users", userId, "goals");

      // Handle vocabulary goal model compatibility
      const isVocabularyGoal =
        goalData.type === "vocabulary" || goalData.category === "vocabulary";

      const newGoal = {
        ...goalData,
        userId,
        // Use vocabulary model fields if applicable
        targetCount: isVocabularyGoal
          ? goalData.targetCount || goalData.target
          : goalData.target,
        period: isVocabularyGoal
          ? goalData.period || goalData.type
          : goalData.type,
        completedCount: isVocabularyGoal ? goalData.completedCount || 0 : 0,
        // Standard fields
        current: goalData.current || 0,
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        startDate: goalData.startDate || Timestamp.now(),
        endDate:
          goalData.endDate ||
          this._calculateEndDate(goalData.type || goalData.period),
        progress: 0,
        isCompleted: false,
        streak: 0,
        lastUpdated: Timestamp.now(),
      };

      const docRef = await addDoc(goalsRef, newGoal);

      // Also create a goal progress tracking document
      await this._createGoalProgress(userId, docRef.id, newGoal);

      return {
        id: docRef.id,
        ...newGoal,
        createdAt: newGoal.createdAt.toDate(),
        updatedAt: newGoal.updatedAt.toDate(),
        startDate: newGoal.startDate.toDate(),
        endDate: newGoal.endDate.toDate(),
        lastUpdated: newGoal.lastUpdated.toDate(),
      };
    } catch (error) {
      console.error("Error creating goal:", error);
      throw new Error("Failed to create goal");
    }
  }

  /**
   * Update an existing goal
   * @param {string} goalId - Goal ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated goal
   */
  async updateGoal(goalId, updates) {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }

      const updatedGoal = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(goalRef, updatedGoal);

      return {
        id: goalId,
        ...goalDoc.data(),
        ...updatedGoal,
        updatedAt: updatedGoal.updatedAt.toDate(),
      };
    } catch (error) {
      console.error("Error updating goal:", error);
      throw new Error("Failed to update goal");
    }
  }

  /**
   * Delete a goal
   * @param {string} goalId - Goal ID
   * @returns {Promise<Object>} Deleted goal
   */
  async deleteGoal(goalId) {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }

      const deletedGoal = goalDoc.data();
      await deleteDoc(goalRef);

      return {
        id: goalId,
        ...deletedGoal,
      };
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw new Error("Failed to delete goal");
    }
  }

  /**
   * Update goal progress
   * @param {string} goalId - Goal ID
   * @param {number} progress - Progress value
   * @returns {Promise<Object>} Updated goal
   */
  async updateGoalProgress(goalId, progress) {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }

      const goalData = goalDoc.data();
      const newProgress = Math.min(progress, goalData.target);
      const progressPercentage = (newProgress / goalData.target) * 100;
      const isCompleted = newProgress >= goalData.target;

      const updatedGoal = {
        current: newProgress,
        progress: progressPercentage,
        isCompleted,
        updatedAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
      };

      await updateDoc(goalRef, updatedGoal);

      // Update goal progress tracking
      await this._updateGoalProgress(goalData.userId, goalId, updatedGoal);

      return {
        id: goalId,
        ...goalData,
        ...updatedGoal,
        updatedAt: updatedGoal.updatedAt.toDate(),
        lastUpdated: updatedGoal.lastUpdated.toDate(),
      };
    } catch (error) {
      console.error("Error updating goal progress:", error);
      throw new Error("Failed to update goal progress");
    }
  }

  /**
   * Get goal analytics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Goal analytics
   */
  async getGoalAnalytics(userId) {
    try {
      const goals = await this.getUserGoals(userId);

      const analytics = {
        totalGoals: goals.length,
        activeGoals: goals.filter((goal) => goal.status === "active").length,
        completedGoals: goals.filter((goal) => goal.isCompleted).length,
        averageProgress: 0,
        goalTypes: {},
        recentGoals: [],
        goalStreak: 0,
      };

      if (goals.length > 0) {
        analytics.averageProgress =
          goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;

        // Group by goal type
        goals.forEach((goal) => {
          const type = goal.type || "general";
          if (!analytics.goalTypes[type]) {
            analytics.goalTypes[type] = {
              count: 0,
              averageProgress: 0,
              completed: 0,
            };
          }
          analytics.goalTypes[type].count++;
          analytics.goalTypes[type].averageProgress += goal.progress;
          if (goal.isCompleted) {
            analytics.goalTypes[type].completed++;
          }
        });

        // Calculate average progress for each type
        Object.keys(analytics.goalTypes).forEach((type) => {
          analytics.goalTypes[type].averageProgress /=
            analytics.goalTypes[type].count;
        });

        // Get recent goals (last 5)
        analytics.recentGoals = goals
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5);

        // Calculate goal streak (consecutive days with goal activity)
        analytics.goalStreak = this._calculateGoalStreak(goals);
      }

      return analytics;
    } catch (error) {
      console.error("Error fetching goal analytics:", error);
      throw new Error("Failed to fetch goal analytics");
    }
  }

  /**
   * Get vocabulary-specific goals
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Vocabulary goals
   */
  async getVocabularyGoals(userId) {
    try {
      const goals = await this.getUserGoals(userId);
      return goals.filter((goal) => goal.type === "vocabulary");
    } catch (error) {
      console.error("Error fetching vocabulary goals:", error);
      throw new Error("Failed to fetch vocabulary goals");
    }
  }

  /**
   * Get study time goals
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Study time goals
   */
  async getStudyTimeGoals(userId) {
    try {
      const goals = await this.getUserGoals(userId);
      return goals.filter((goal) => goal.type === "study_time");
    } catch (error) {
      console.error("Error fetching study time goals:", error);
      throw new Error("Failed to fetch study time goals");
    }
  }

  /**
   * Get lesson completion goals
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Lesson completion goals
   */
  async getLessonCompletionGoals(userId) {
    try {
      const goals = await this.getUserGoals(userId);
      return goals.filter((goal) => goal.type === "lesson_completion");
    } catch (error) {
      console.error("Error fetching lesson completion goals:", error);
      throw new Error("Failed to fetch lesson completion goals");
    }
  }

  /**
   * Create a vocabulary goal following the vocabulary goal model
   * @param {string} userId - User ID
   * @param {Object} goalData - Vocabulary goal data
   * @returns {Promise<Object>} Created vocabulary goal
   */
  async createVocabularyGoal(userId, goalData) {
    const vocabularyGoal = {
      ...goalData,
      type: "vocabulary",
      unit: "words",
      category: "learning",
      // Align with vocabulary goal model
      targetCount: goalData.target || goalData.targetCount, // Use targetCount as per model
      period: goalData.type || goalData.period, // Use period as per model
      completedCount: 0, // Initialize completed count
      startDate: goalData.startDate || Timestamp.now(),
      endDate:
        goalData.endDate ||
        this._calculateEndDate(goalData.type || goalData.period),
    };

    return this.createGoal(userId, vocabularyGoal);
  }

  /**
   * Create a study time goal
   * @param {string} userId - User ID
   * @param {Object} goalData - Study time goal data
   * @returns {Promise<Object>} Created study time goal
   */
  async createStudyTimeGoal(userId, goalData) {
    const studyTimeGoal = {
      ...goalData,
      type: "study_time",
      unit: "minutes",
      category: "time",
    };

    return this.createGoal(userId, studyTimeGoal);
  }

  /**
   * Create a lesson completion goal
   * @param {string} userId - User ID
   * @param {Object} goalData - Lesson completion goal data
   * @returns {Promise<Object>} Created lesson completion goal
   */
  async createLessonCompletionGoal(userId, goalData) {
    const lessonGoal = {
      ...goalData,
      type: "lesson_completion",
      unit: "lessons",
      category: "completion",
    };

    return this.createGoal(userId, lessonGoal);
  }

  /**
   * Reset goal progress
   * @param {string} goalId - Goal ID
   * @returns {Promise<Object>} Reset goal
   */
  async resetGoalProgress(goalId) {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }

      const goalData = goalDoc.data();
      const resetGoal = {
        current: 0,
        progress: 0,
        isCompleted: false,
        updatedAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
      };

      await updateDoc(goalRef, resetGoal);

      return {
        id: goalId,
        ...goalData,
        ...resetGoal,
        updatedAt: resetGoal.updatedAt.toDate(),
        lastUpdated: resetGoal.lastUpdated.toDate(),
      };
    } catch (error) {
      console.error("Error resetting goal progress:", error);
      throw new Error("Failed to reset goal progress");
    }
  }

  /**
   * Check and award goal completion achievements
   * @param {string} userId - User ID
   * @param {string} goalId - Goal ID
   * @returns {Promise<void>}
   */
  async checkGoalAchievements(userId, goalId) {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) return;

      const goalData = goalDoc.data();

      if (goalData.isCompleted && !goalData.achievementAwarded) {
        // Award achievement for goal completion
        await this._awardGoalAchievement(userId, goalData);

        // Mark achievement as awarded
        await updateDoc(goalRef, { achievementAwarded: true });
      }
    } catch (error) {
      console.error("Error checking goal achievements:", error);
    }
  }

  // Private helper methods

  /**
   * Calculate end date based on goal type
   * @param {string} type - Goal type
   * @returns {Timestamp} End date
   */
  _calculateEndDate(type) {
    const now = new Date();
    let endDate;

    switch (type) {
      case "daily":
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "weekly":
        endDate = new Date(now.setDate(now.getDate() + 7));
        break;
      case "monthly":
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      default:
        endDate = new Date(now.setDate(now.getDate() + 30));
    }

    return Timestamp.fromDate(endDate);
  }

  /**
   * Create goal progress tracking document
   * @param {string} userId - User ID
   * @param {string} goalId - Goal ID
   * @param {Object} goalData - Goal data
   * @returns {Promise<void>}
   */
  async _createGoalProgress(userId, goalId, goalData) {
    try {
      const progressRef = doc(db, "users", userId, "goalProgress", goalId);
      const progressData = {
        goalId,
        userId,
        type: goalData.type,
        target: goalData.target,
        current: 0,
        progress: 0,
        isCompleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        dailyProgress: [],
        weeklyProgress: [],
        monthlyProgress: [],
      };

      await setDoc(progressRef, progressData);
    } catch (error) {
      console.error("Error creating goal progress:", error);
    }
  }

  /**
   * Update goal progress tracking
   * @param {string} userId - User ID
   * @param {string} goalId - Goal ID
   * @param {Object} progressData - Progress data
   * @returns {Promise<void>}
   */
  async _updateGoalProgress(userId, goalId, progressData) {
    try {
      const progressRef = doc(db, "users", userId, "goalProgress", goalId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const existingData = progressDoc.data();
        const today = new Date().toISOString().split("T")[0];

        // Update daily progress
        const dailyProgress = existingData.dailyProgress || [];
        const todayIndex = dailyProgress.findIndex(
          (entry) => entry.date === today
        );

        if (todayIndex >= 0) {
          dailyProgress[todayIndex].progress = progressData.current;
        } else {
          dailyProgress.push({
            date: today,
            progress: progressData.current,
          });
        }

        await updateDoc(progressRef, {
          current: progressData.current,
          progress: progressData.progress,
          isCompleted: progressData.isCompleted,
          updatedAt: Timestamp.now(),
          dailyProgress: dailyProgress.slice(-30), // Keep last 30 days
        });
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  }

  /**
   * Calculate goal streak
   * @param {Array} goals - User goals
   * @returns {number} Goal streak
   */
  _calculateGoalStreak(goals) {
    if (goals.length === 0) return 0;

    const sortedGoals = goals
      .filter((goal) => goal.isCompleted)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (sortedGoals.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasActivity = sortedGoals.some((goal) => {
        const goalDate = new Date(goal.updatedAt);
        goalDate.setHours(0, 0, 0, 0);
        return goalDate.getTime() === checkDate.getTime();
      });

      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Award goal completion achievement
   * @param {string} userId - User ID
   * @param {Object} goalData - Goal data
   * @returns {Promise<void>}
   */
  async _awardGoalAchievement(userId, goalData) {
    try {
      // This would integrate with the achievement service
      // For now, we'll just log the achievement
      console.log(
        `Goal achievement awarded: ${goalData.title} completed by user ${userId}`
      );

      // TODO: Integrate with studentAchievementService
      // await studentAchievementService.awardAchievement(userId, 'goal_completed');
    } catch (error) {
      console.error("Error awarding goal achievement:", error);
    }
  }
}

export default new StudentGoalsService();
