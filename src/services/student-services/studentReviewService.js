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
  Timestamp,
  setDoc,
  runTransaction,
} from "firebase/firestore";

/**
 * Comprehensive Review Management Service
 * Implements FSRS (Free Spaced Repetition Scheduler) algorithm
 * Handles all review-related operations including creation, updates, and analytics
 */
class StudentReviewService {
  constructor() {
    this.reviewItemsCollection = "reviewItems";
  }

  /**
   * Get review queue for a user (items due for review)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of review items due for review
   */
  async getReviewQueue(userId) {
    try {
      const now = Timestamp.now();
      const reviewItemsRef = collection(
        db,
        "users",
        userId,
        this.reviewItemsCollection
      );

      // First, get all active items for the user
      const q = query(
        reviewItemsRef,
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);

      // Filter items that are due for review on the client side
      const reviewItems = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          nextReviewDate: doc.data().nextReviewDate?.toDate(),
          lastReviewedDate: doc.data().lastReviewedDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }))
        .filter((item) => {
          // Filter items that are due for review (nextReviewDate is in the past or today)
          if (!item.nextReviewDate) return false;
          const nowDate = new Date();
          const reviewDate = new Date(item.nextReviewDate);
          return reviewDate <= nowDate;
        })
        .sort((a, b) => {
          // Sort by nextReviewDate ascending (earliest due first)
          if (!a.nextReviewDate || !b.nextReviewDate) return 0;
          return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
        });

      return reviewItems;
    } catch (error) {
      console.error("Error fetching review queue:", error);
      throw new Error("Failed to fetch review queue");
    }
  }

  /**
   * Update review item based on user performance
   * @param {string} userId - User ID
   * @param {string} itemId - Review item ID
   * @param {string} performance - Performance rating ('forgot', 'hard', 'good', 'easy')
   * @returns {Promise<Object>} Updated review item
   */
  async updateReviewItem(userId, itemId, performance) {
    try {
      const itemRef = doc(
        db,
        "users",
        userId,
        this.reviewItemsCollection,
        itemId
      );
      const itemDoc = await getDoc(itemRef);

      if (!itemDoc.exists()) {
        throw new Error("Review item not found");
      }

      const itemData = itemDoc.data();
      const now = Timestamp.now();

      // Calculate new SRS parameters using FSRS algorithm
      const newParams = this._calculateNextReview(
        performance,
        itemData.easeFactor || 2.5,
        itemData.interval || 0,
        itemData.repetitions || 0,
        itemData.lapses || 0
      );

      // Update review history
      const reviewHistory = itemData.reviewHistory || [];
      reviewHistory.push({
        date: now,
        performance: performance,
        timeSpent: 0, // TODO: Add time tracking
        confidence: 0, // TODO: Add confidence tracking
      });

      // Keep only last 10 reviews for performance
      const trimmedHistory = reviewHistory.slice(-10);

      const updatedItem = {
        ...itemData,
        nextReviewDate: newParams.nextReviewDate,
        lastReviewedDate: now,
        easeFactor: newParams.easeFactor,
        interval: newParams.interval,
        repetitions: newParams.repetitions,
        lapses: newParams.lapses,
        reviewHistory: trimmedHistory,
        updatedAt: now,
      };

      await updateDoc(itemRef, updatedItem);

      return {
        id: itemId,
        ...updatedItem,
        nextReviewDate: updatedItem.nextReviewDate.toDate(),
        lastReviewedDate: updatedItem.lastReviewedDate.toDate(),
        updatedAt: updatedItem.updatedAt.toDate(),
      };
    } catch (error) {
      console.error("Error updating review item:", error);
      throw new Error("Failed to update review item");
    }
  }

  /**
   * Create a new review item
   * @param {string} userId - User ID
   * @param {Object} contentRef - Reference to the original content
   * @param {string} itemType - Type of review item ('vocabulary', 'grammar', 'pronunciation')
   * @returns {Promise<Object>} Created review item
   */
  async createReviewItem(userId, contentRef, itemType) {
    try {
      const reviewItemsRef = collection(
        db,
        "users",
        userId,
        this.reviewItemsCollection
      );
      const now = Timestamp.now();

      // Calculate initial review date (first review after 1 day)
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);

      const newReviewItem = {
        userId,
        itemType,
        contentRef: contentRef.id || contentRef,
        contentData: {
          title: contentRef.title || contentRef.word || "Review Item",
          description: contentRef.description || contentRef.definition || "",
          example: contentRef.example || "",
          audioUrl: contentRef.audioUrl || "",
        },
        nextReviewDate: Timestamp.fromDate(nextReviewDate),
        lastReviewedDate: null,
        easeFactor: 2.5, // Initial ease factor
        interval: 0,
        repetitions: 0,
        lapses: 0,
        difficulty: contentRef.difficulty || 3,
        timeSpent: 0,
        confidenceLevel: 0,
        reviewHistory: [],
        createdAt: now,
        updatedAt: now,
        status: "active",
        tags: contentRef.tags || [],
        sourceLesson: contentRef.sourceLesson || "",
        sourceCourse: contentRef.sourceCourse || "",
      };

      const docRef = await addDoc(reviewItemsRef, newReviewItem);

      return {
        id: docRef.id,
        ...newReviewItem,
        nextReviewDate: newReviewItem.nextReviewDate.toDate(),
        createdAt: newReviewItem.createdAt.toDate(),
        updatedAt: newReviewItem.updatedAt.toDate(),
      };
    } catch (error) {
      console.error("Error creating review item:", error);
      throw new Error("Failed to create review item");
    }
  }

  /**
   * Create review items from lesson completion
   * @param {string} userId - User ID
   * @param {Object} lessonData - Lesson data containing items to review
   * @returns {Promise<Array>} Array of created review items
   */
  async createReviewItemsFromLesson(userId, lessonData) {
    try {
      const reviewItems = [];

      if (lessonData.vocabulary && lessonData.vocabulary.length > 0) {
        for (const word of lessonData.vocabulary) {
          const reviewItem = await this.createReviewItem(
            userId,
            {
              ...word,
              sourceLesson: lessonData.lessonId,
              sourceCourse: lessonData.courseId,
            },
            "vocabulary"
          );
          reviewItems.push(reviewItem);
        }
      }

      if (lessonData.grammar && lessonData.grammar.length > 0) {
        for (const rule of lessonData.grammar) {
          const reviewItem = await this.createReviewItem(
            userId,
            {
              ...rule,
              sourceLesson: lessonData.lessonId,
              sourceCourse: lessonData.courseId,
            },
            "grammar"
          );
          reviewItems.push(reviewItem);
        }
      }

      return reviewItems;
    } catch (error) {
      console.error("Error creating review items from lesson:", error);
      throw new Error("Failed to create review items from lesson");
    }
  }

  /**
   * Get review analytics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Review analytics data
   */
  async getReviewAnalytics(userId) {
    try {
      const reviewItemsRef = collection(
        db,
        "users",
        userId,
        this.reviewItemsCollection
      );
      const snapshot = await getDocs(reviewItemsRef);

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        nextReviewDate: doc.data().nextReviewDate?.toDate(),
        lastReviewedDate: doc.data().lastReviewedDate?.toDate(),
      }));

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate analytics
      const totalReviews = items.reduce(
        (sum, item) => sum + (item.reviewHistory?.length || 0),
        0
      );
      const activeItems = items.filter((item) => item.status === "active");
      const itemsDueToday = items.filter(
        (item) =>
          item.nextReviewDate &&
          item.nextReviewDate <= now &&
          item.status === "active"
      ).length;

      // Calculate average accuracy from recent reviews
      const recentReviews = items.flatMap((item) =>
        (item.reviewHistory || [])
          .filter((review) => {
            const reviewDate = review.date?.toDate?.() || new Date(review.date);
            return (
              reviewDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ); // Last 30 days
          })
          .map((review) => review.performance)
      );

      const performanceScores = {
        forgot: 0,
        hard: 0.3,
        good: 0.7,
        easy: 1,
      };

      const averageAccuracy =
        recentReviews.length > 0
          ? recentReviews.reduce(
              (sum, perf) => sum + (performanceScores[perf] || 0),
              0
            ) / recentReviews.length
          : 0;

      // Calculate current streak
      const sortedReviews = items
        .flatMap((item) =>
          (item.reviewHistory || []).map((review) => ({
            date: review.date?.toDate?.() || new Date(review.date),
            performance: review.performance,
          }))
        )
        .sort((a, b) => b.date - a.date);

      let currentStreak = 0;
      let currentDate = today;

      for (const review of sortedReviews) {
        const reviewDate = new Date(
          review.date.getFullYear(),
          review.date.getMonth(),
          review.date.getDate()
        );
        const daysDiff = Math.floor(
          (currentDate - reviewDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          currentStreak++;
          currentDate = reviewDate;
        } else {
          break;
        }
      }

      return {
        totalReviews,
        activeItems: activeItems.length,
        itemsDueToday,
        averageAccuracy: Math.round(averageAccuracy * 100),
        currentStreak,
        totalItems: items.length,
        reviewTrend: this._calculateReviewTrend(items),
      };
    } catch (error) {
      console.error("Error fetching review analytics:", error);
      throw new Error("Failed to fetch review analytics");
    }
  }

  /**
   * FSRS Algorithm Implementation
   * Calculates next review date and updates SRS parameters
   * @param {string} performance - Performance rating
   * @param {number} easeFactor - Current ease factor
   * @param {number} interval - Current interval
   * @param {number} repetitions - Current repetitions
   * @param {number} lapses - Current lapses
   * @returns {Object} Updated SRS parameters
   */
  _calculateNextReview(performance, easeFactor, interval, repetitions, lapses) {
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;
    let newLapses = lapses;

    // Update ease factor based on performance
    switch (performance) {
      case "forgot":
        newEaseFactor = Math.max(1.3, easeFactor - 0.2);
        newRepetitions = 0;
        newLapses += 1;
        newInterval = 1; // Review again tomorrow
        break;

      case "hard":
        newEaseFactor = Math.max(1.3, easeFactor - 0.15);
        newRepetitions = 0;
        newInterval = Math.max(1, interval * 1.2);
        break;

      case "good":
        newEaseFactor = easeFactor; // No change
        newRepetitions += 1;
        if (newRepetitions === 1) {
          newInterval = 1;
        } else if (newRepetitions === 2) {
          newInterval = 6;
        } else {
          newInterval = Math.round(interval * easeFactor);
        }
        break;

      case "easy":
        newEaseFactor = easeFactor + 0.15;
        newRepetitions += 1;
        newInterval = Math.round(interval * easeFactor * 1.3);
        break;

      default:
        // Default to 'good' behavior
        newRepetitions += 1;
        if (newRepetitions === 1) {
          newInterval = 1;
        } else if (newRepetitions === 2) {
          newInterval = 6;
        } else {
          newInterval = Math.round(interval * easeFactor);
        }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      nextReviewDate: Timestamp.fromDate(nextReviewDate),
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      lapses: newLapses,
    };
  }

  /**
   * Calculate review trend over time
   * @param {Array} items - Review items
   * @returns {Object} Review trend data
   */
  _calculateReviewTrend(items) {
    const now = new Date();
    const last7Days = [];
    const last30Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toISOString().split("T")[0],
        count: 0,
      });
    }

    // Count reviews per day
    items.forEach((item) => {
      (item.reviewHistory || []).forEach((review) => {
        const reviewDate = review.date?.toDate?.() || new Date(review.date);
        const dateStr = reviewDate.toISOString().split("T")[0];

        const dayIndex = last7Days.findIndex((day) => day.date === dateStr);
        if (dayIndex !== -1) {
          last7Days[dayIndex].count++;
        }
      });
    });

    return {
      last7Days,
      averageDailyReviews:
        last7Days.reduce((sum, day) => sum + day.count, 0) / 7,
    };
  }
}

// Export singleton instance
const studentReviewService = new StudentReviewService();
export default studentReviewService;
