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
  Timestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/**
 * Sync totalStudyTime in user document with sum of all todayStats studyTime
 * @param {string} userId - User ID
 * @returns {Promise<number>} Updated total study time in minutes
 */
const syncTotalStudyTime = async (userId) => {
  try {
    // Get all todayStats documents for this user
    const todayStatsRef = collection(db, "users", userId, "todayStats");
    const todayStatsSnapshot = await getDocs(todayStatsRef);

    let totalStudyTimeInSeconds = 0;

    todayStatsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.studyTime) {
        totalStudyTimeInSeconds += data.studyTime;
      }
    });

    // Convert to minutes for user document
    const totalStudyTimeInMinutes = Math.ceil(totalStudyTimeInSeconds / 60);

    // Update user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      totalStudyTime: totalStudyTimeInMinutes,
      lastUpdated: Timestamp.now(),
    });

    console.log(
      `Synced totalStudyTime: ${totalStudyTimeInSeconds} seconds = ${totalStudyTimeInMinutes} minutes`
    );

    return totalStudyTimeInMinutes;
  } catch (error) {
    console.error("Error syncing totalStudyTime:", error);
    throw new Error("Failed to sync total study time");
  }
};

/**
 * Get today's statistics for a user
 * @param {string} userId - User ID
 * @param {string} date - Optional date string (YYYY-MM-DD), defaults to today
 * @returns {Promise<Object>} Today's stats
 */
const getTodayStats = async (userId, date = null) => {
  try {
    const dateString = date || new Date().toISOString().split("T")[0];
    const todayStatsRef = doc(db, "users", userId, "todayStats", dateString);
    const todayStatsDoc = await getDoc(todayStatsRef);

    if (todayStatsDoc.exists()) {
      return todayStatsDoc.data();
    }

    // If no stats exist for today, calculate from activities
    const activitiesRef = collection(db, "users", userId, "activities");
    const todayQuery = query(
      activitiesRef,
      where("timestamp", ">=", Timestamp.fromDate(new Date(dateString))),
      where(
        "timestamp",
        "<",
        Timestamp.fromDate(new Date(dateString + "T23:59:59"))
      )
    );

    const activitiesSnapshot = await getDocs(todayQuery);
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    const todayStats = calculateTodayStats(activities);

    // Save calculated stats
    await setDoc(todayStatsRef, {
      ...todayStats,
      date: dateString,
      lastUpdated: Timestamp.now(),
    });

    return todayStats;
  } catch (error) {
    console.error("Error fetching today's stats:", error);
    throw new Error("Failed to fetch today's statistics");
  }
};

/**
 * Get weekly study statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Weekly stats
 */
const getWeeklyStats = async (userId) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weeklyStats = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      const dayStats = await getTodayStats(userId, dateString);
      weeklyStats.push({
        date: dateString,
        ...dayStats,
      });
    }

    return weeklyStats;
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    throw new Error("Failed to fetch weekly statistics");
  }
};

/**
 * Get monthly study statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Monthly stats
 */
const getMonthlyStats = async (userId) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const activitiesRef = collection(db, "users", userId, "activities");
    const monthlyActivitiesQuery = query(
      activitiesRef,
      where("timestamp", ">=", Timestamp.fromDate(startOfMonth)),
      where("timestamp", "<=", Timestamp.fromDate(endOfMonth))
    );

    const monthlyActivitiesSnapshot = await getDocs(monthlyActivitiesQuery);
    const activities = monthlyActivitiesSnapshot.docs.map((doc) => doc.data());

    return calculateMonthlyStats(activities);
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw new Error("Failed to fetch monthly statistics");
  }
};

/**
 * Calculate today's statistics from activities
 * @param {Array} activities - Array of today's activities
 * @returns {Object} Calculated stats
 */
const calculateTodayStats = (activities) => {
  const stats = {
    studyTime: 0,
    lessonsCompleted: 0,
    vocabularyWords: 0,
    pronunciationPractice: 0,
    quizzesTaken: 0,
    goalsProgress: 0,
    streak: 0, // This should be calculated from user's streak data
  };

  activities.forEach((activity) => {
    switch (activity.type) {
      case "lesson_completed":
        stats.lessonsCompleted++;
        stats.studyTime += activity.duration || 0;
        break;
      case "vocabulary_practice":
        stats.vocabularyWords += activity.wordsPracticed || 0;
        stats.studyTime += activity.duration || 0;
        break;
      case "pronunciation_practice":
        stats.pronunciationPractice += activity.wordsPracticed || 0;
        stats.studyTime += activity.duration || 0;
        break;
      case "quiz_completed":
        stats.quizzesTaken++;
        stats.studyTime += activity.duration || 0;
        break;
    }
  });

  return stats;
};

/**
 * Calculate monthly statistics from activities
 * @param {Array} activities - Array of month's activities
 * @returns {Object} Calculated monthly stats
 */
const calculateMonthlyStats = (activities) => {
  const stats = {
    totalStudyTime: 0,
    totalLessonsCompleted: 0,
    totalVocabularyWords: 0,
    totalPronunciationPractice: 0,
    totalQuizzesTaken: 0,
    averageDailyStudyTime: 0,
    studyDays: 0,
  };

  const dailyStats = {};

  activities.forEach((activity) => {
    const date = activity.timestamp.toDate().toISOString().split("T")[0];

    if (!dailyStats[date]) {
      dailyStats[date] = {
        studyTime: 0,
        lessonsCompleted: 0,
        vocabularyWords: 0,
        pronunciationPractice: 0,
        quizzesTaken: 0,
      };
    }

    switch (activity.type) {
      case "lesson_completed":
        dailyStats[date].lessonsCompleted++;
        dailyStats[date].studyTime += activity.duration || 0;
        break;
      case "vocabulary_practice":
        dailyStats[date].vocabularyWords += activity.wordsPracticed || 0;
        dailyStats[date].studyTime += activity.duration || 0;
        break;
      case "pronunciation_practice":
        dailyStats[date].pronunciationPractice += activity.wordsPracticed || 0;
        dailyStats[date].studyTime += activity.duration || 0;
        break;
      case "quiz_completed":
        dailyStats[date].quizzesTaken++;
        dailyStats[date].studyTime += activity.duration || 0;
        break;
    }
  });

  // Aggregate daily stats
  Object.values(dailyStats).forEach((dayStats) => {
    stats.totalStudyTime += dayStats.studyTime;
    stats.totalLessonsCompleted += dayStats.lessonsCompleted;
    stats.totalVocabularyWords += dayStats.vocabularyWords;
    stats.totalPronunciationPractice += dayStats.pronunciationPractice;
    stats.totalQuizzesTaken += dayStats.quizzesTaken;

    if (dayStats.studyTime > 0) {
      stats.studyDays++;
    }
  });

  stats.averageDailyStudyTime =
    stats.studyDays > 0 ? stats.totalStudyTime / stats.studyDays : 0;

  return stats;
};

/**
 * Update today's stats when an activity is completed
 * @param {string} userId - User ID
 * @param {Object} activity - Activity data
 */
const updateTodayStats = async (userId, activity) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const todayStatsRef = doc(db, "users", userId, "todayStats", dateString);

    const todayStatsDoc = await getDoc(todayStatsRef);
    const currentStats = todayStatsDoc.exists()
      ? todayStatsDoc.data()
      : {
          studyTime: 0,
          lessonsCompleted: 0,
          vocabularyWords: 0,
          pronunciationPractice: 0,
          quizzesTaken: 0,
          date: dateString,
        };

    // Update stats based on activity type
    switch (activity.type) {
      case "lesson_completed":
        currentStats.lessonsCompleted++;
        currentStats.studyTime += activity.duration || 0;
        break;
      case "vocabulary_practice":
        currentStats.vocabularyWords += activity.wordsPracticed || 0;
        currentStats.studyTime += activity.duration || 0;
        break;
      case "pronunciation_practice":
        currentStats.pronunciationPractice += activity.wordsPracticed || 0;
        currentStats.studyTime += activity.duration || 0;
        break;
      case "quiz_completed":
        currentStats.quizzesTaken++;
        currentStats.studyTime += activity.duration || 0;
        break;
    }

    currentStats.lastUpdated = Timestamp.now();

    await setDoc(todayStatsRef, currentStats);
  } catch (error) {
    console.error("Error updating today stats:", error);
  }
};

export {
  getTodayStats,
  getWeeklyStats,
  getMonthlyStats,
  updateTodayStats,
  syncTotalStudyTime,
};
