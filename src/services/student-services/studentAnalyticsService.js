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
} from "firebase/firestore";

/**
 * Get study trends for a user over a specified time range
 * @param {string} userId - User ID
 * @param {string} timeRange - Time range ('week', 'month', 'year')
 * @returns {Promise<Object>} Study trends data
 */
export const getStudyTrends = async (userId, timeRange = "week") => {
  try {
    const today = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case "year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }

    endDate = today;

    // Get activities within the time range
    const activitiesRef = collection(db, "users", userId, "activities");
    let activities = [];

    try {
      // Try the optimized query first (requires composite index)
      const trendsQuery = query(
        activitiesRef,
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "asc")
      );
      const activitiesSnapshot = await getDocs(trendsQuery);
      activities = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        activities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => {
            return (
              activity.timestamp >= startDate && activity.timestamp <= endDate
            );
          })
          .sort((a, b) => a.timestamp - b.timestamp);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        activities = [];
      }
    }

    return processStudyTrends(activities, timeRange);
  } catch (error) {
    console.error("Error fetching study trends:", error);
    // Return default trends instead of throwing error
    return {
      labels: [],
      studyTimeData: [],
      lessonsCompletedData: [],
      vocabularyData: [],
      pronunciationData: [],
    };
  }
};

/**
 * Get real-time study trends with enhanced metrics
 * @param {string} userId - User ID
 * @param {string} timeRange - Time range ('day', 'week', 'month', 'year')
 * @returns {Promise<Object>} Real-time study trends data
 */
export const getRealTimeStudyTrends = async (userId, timeRange = "week") => {
  try {
    // 1. Fetch real-time activities from Firebase
    const activitiesRef = collection(db, "users", userId, "activities");
    let activities = [];

    try {
      // Try the optimized query first (requires composite index)
      const realTimeQuery = query(
        activitiesRef,
        where("timestamp", ">=", Timestamp.fromDate(getStartDate(timeRange))),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const snapshot = await getDocs(realTimeQuery);
      activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        activities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => {
            const startDate = getStartDate(timeRange);
            return activity.timestamp >= startDate;
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 1000);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        activities = [];
      }
    }

    // 3. Group by activity type and calculate metrics
    const metrics = {
      studyTime: activities.reduce((sum, act) => sum + (act.duration || 0), 0),
      lessonsCompleted: activities.filter(
        (act) => act.type === "lesson_completed"
      ).length,
      vocabularyWords: activities
        .filter((act) => act.type === "vocabulary_practice")
        .reduce((sum, act) => sum + (act.wordsPracticed || 0), 0),
      pronunciationPractice: activities
        .filter((act) => act.type === "pronunciation_practice")
        .reduce((sum, act) => sum + (act.wordsPracticed || 0), 0),
      quizzesTaken: activities.filter((act) => act.type === "quiz_completed")
        .length,
      averageAccuracy: calculateAverageAccuracy(activities),
      streakDays: calculateStreakDays(activities),
      totalPoints: activities.reduce((sum, act) => sum + (act.points || 0), 0),
    };

    return metrics;
  } catch (error) {
    console.error("Error fetching real-time study trends:", error);
    // Return default metrics instead of throwing error
    return {
      studyTime: 0,
      lessonsCompleted: 0,
      vocabularyWords: 0,
      pronunciationPractice: 0,
      quizzesTaken: 0,
      averageAccuracy: 0,
      streakDays: 0,
      totalPoints: 0,
    };
  }
};

/**
 * Get vocabulary analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Vocabulary analytics
 */
export const getVocabularyAnalytics = async (userId) => {
  try {
    // Get vocabulary progress data
    const vocabularyProgressRef = collection(
      db,
      "users",
      userId,
      "vocabularyProgress"
    );
    const progressSnapshot = await getDocs(vocabularyProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // Get vocabulary activities
    const activitiesRef = collection(db, "users", userId, "activities");
    let vocabularyActivities = [];

    try {
      // Try the optimized query first (requires composite index)
      const vocabularyQuery = query(
        activitiesRef,
        where("type", "==", "vocabulary_practice"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const vocabularySnapshot = await getDocs(vocabularyQuery);
      vocabularyActivities = vocabularySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        vocabularyActivities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => activity.type === "vocabulary_practice")
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        vocabularyActivities = [];
      }
    }

    return processVocabularyAnalytics(progressData, vocabularyActivities);
  } catch (error) {
    console.error("Error fetching vocabulary analytics:", error);
    // Return default analytics instead of throwing error
    return {
      totalWords: 0,
      learnedWords: 0,
      accuracyRate: 0,
      practiceSessions: 0,
      newThisWeek: 0,
      progressPercentage: 0,
      recentActivities: [],
    };
  }
};

/**
 * Get enhanced vocabulary analytics with detailed metrics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Enhanced vocabulary analytics
 */
export const getEnhancedVocabularyAnalytics = async (userId) => {
  try {
    // 1. Fetch vocabulary progress with detailed metrics
    const vocabularyProgressRef = collection(
      db,
      "users",
      userId,
      "vocabularyProgress"
    );
    const progressSnapshot = await getDocs(vocabularyProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // 2. Fetch vocabulary activities with detailed tracking
    const activitiesRef = collection(db, "users", userId, "activities");
    let vocabularyActivities = [];

    try {
      // Try the optimized query first (requires composite index)
      const vocabularyQuery = query(
        activitiesRef,
        where("type", "==", "vocabulary_practice"),
        orderBy("timestamp", "desc"),
        limit(500)
      );
      const vocabularySnapshot = await getDocs(vocabularyQuery);
      vocabularyActivities = vocabularySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        vocabularyActivities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => activity.type === "vocabulary_practice")
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 500);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        vocabularyActivities = [];
      }
    }

    // 3. Calculate comprehensive vocabulary metrics
    const metrics = {
      totalWords: progressData.reduce(
        (sum, progress) => sum + (progress.totalWords || 0),
        0
      ),
      learnedWords: progressData.reduce(
        (sum, progress) => sum + (progress.learnedWords || 0),
        0
      ),
      accuracyRate: calculateVocabularyAccuracy(vocabularyActivities),
      practiceSessions: vocabularyActivities.length,
      newThisWeek: calculateNewWordsThisWeek(vocabularyActivities),
      newThisMonth: calculateNewWordsThisMonth(vocabularyActivities),
      averageSessionLength: calculateAverageSessionLength(vocabularyActivities),
      difficultyLevel: calculateDifficultyLevel(vocabularyActivities),
      retentionRate: calculateRetentionRate(vocabularyActivities),
      progressPercentage: calculateVocabularyProgress(progressData),
      recentActivities: vocabularyActivities.slice(0, 10),
      weeklyProgress: calculateWeeklyVocabularyProgress(vocabularyActivities),
      monthlyProgress: calculateMonthlyVocabularyProgress(vocabularyActivities),
    };

    return metrics;
  } catch (error) {
    console.error("Error fetching enhanced vocabulary analytics:", error);
    // Return default metrics instead of throwing error
    return {
      totalWords: 0,
      learnedWords: 0,
      accuracyRate: 0,
      practiceSessions: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      averageSessionLength: 0,
      difficultyLevel: "beginner",
      retentionRate: 0,
      progressPercentage: 0,
      recentActivities: [],
      weeklyProgress: [],
      monthlyProgress: [],
    };
  }
};

/**
 * Get pronunciation analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Pronunciation analytics
 */
export const getPronunciationAnalytics = async (userId) => {
  try {
    // Get pronunciation progress data
    const pronunciationProgressRef = collection(
      db,
      "users",
      userId,
      "pronunciationProgress"
    );
    const progressSnapshot = await getDocs(pronunciationProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // Get pronunciation activities
    const activitiesRef = collection(db, "users", userId, "activities");
    let pronunciationActivities = [];

    try {
      // Try the optimized query first (requires composite index)
      const pronunciationQuery = query(
        activitiesRef,
        where("type", "==", "pronunciation_practice"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const pronunciationSnapshot = await getDocs(pronunciationQuery);
      pronunciationActivities = pronunciationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        pronunciationActivities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => activity.type === "pronunciation_practice")
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        pronunciationActivities = [];
      }
    }

    return processPronunciationAnalytics(progressData, pronunciationActivities);
  } catch (error) {
    console.error("Error fetching pronunciation analytics:", error);
    // Return default analytics instead of throwing error
    return {
      averageAccuracy: 0,
      wordsPracticed: 0,
      practiceSessions: 0,
      improvementRate: 0,
      recentActivities: [],
    };
  }
};

/**
 * Get enhanced pronunciation analytics with detailed metrics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Enhanced pronunciation analytics
 */
export const getEnhancedPronunciationAnalytics = async (userId) => {
  try {
    // 1. Fetch pronunciation progress with detailed metrics
    const pronunciationProgressRef = collection(
      db,
      "users",
      userId,
      "pronunciationProgress"
    );
    const progressSnapshot = await getDocs(pronunciationProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    // 2. Fetch pronunciation activities with detailed tracking
    const activitiesRef = collection(db, "users", userId, "activities");
    let pronunciationActivities = [];

    try {
      // Try the optimized query first (requires composite index)
      const pronunciationQuery = query(
        activitiesRef,
        where("type", "==", "pronunciation_practice"),
        orderBy("timestamp", "desc"),
        limit(500)
      );
      const pronunciationSnapshot = await getDocs(pronunciationQuery);
      pronunciationActivities = pronunciationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (indexError) {
      console.warn(
        "Composite index not available, using fallback query:",
        indexError
      );
      // Fallback: Get all activities and filter on client side
      try {
        const allActivitiesSnapshot = await getDocs(activitiesRef);
        pronunciationActivities = allActivitiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
          .filter((activity) => activity.type === "pronunciation_practice")
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 500);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty activities array if both queries fail
        pronunciationActivities = [];
      }
    }

    // 3. Calculate comprehensive pronunciation metrics
    const metrics = {
      averageAccuracy: calculatePronunciationAccuracy(pronunciationActivities),
      wordsPracticed: pronunciationActivities.reduce(
        (sum, act) => sum + (act.wordsPracticed || 0),
        0
      ),
      perfectScores: pronunciationActivities.filter(
        (act) => act.accuracy === 100
      ).length,
      practiceSessions: pronunciationActivities.length,
      averageSessionLength: calculateAveragePronunciationSessionLength(
        pronunciationActivities
      ),
      difficultyLevel: calculatePronunciationDifficultyLevel(
        pronunciationActivities
      ),
      improvementRate: calculatePronunciationImprovementRate(
        pronunciationActivities
      ),
      accentAccuracy: calculateAccentAccuracy(pronunciationActivities),
      fluencyScore: calculateFluencyScore(pronunciationActivities),
      progressPercentage: calculatePronunciationProgress(
        pronunciationActivities
      ),
      recentActivities: pronunciationActivities.slice(0, 10),
      weeklyProgress: calculateWeeklyPronunciationProgress(
        pronunciationActivities
      ),
      monthlyProgress: calculateMonthlyPronunciationProgress(
        pronunciationActivities
      ),
    };

    return metrics;
  } catch (error) {
    console.error("Error fetching enhanced pronunciation analytics:", error);
    // Return default metrics instead of throwing error
    return {
      averageAccuracy: 0,
      wordsPracticed: 0,
      perfectScores: 0,
      practiceSessions: 0,
      averageSessionLength: 0,
      difficultyLevel: "beginner",
      improvementRate: 0,
      accentAccuracy: 0,
      fluencyScore: 0,
      progressPercentage: 0,
      recentActivities: [],
      weeklyProgress: [],
      monthlyProgress: [],
    };
  }
};

/**
 * Process study trends data for charts
 * @param {Array} activities - Array of activities
 * @param {string} timeRange - Time range
 * @returns {Object} Processed trends data
 */
const processStudyTrends = (activities, timeRange) => {
  const dailyStats = {};
  const labels = [];
  const studyTimeData = [];
  const lessonsCompletedData = [];
  const vocabularyData = [];
  const pronunciationData = [];

  // Group activities by date
  activities.forEach((activity) => {
    const date = activity.timestamp.toDate().toISOString().split("T")[0];

    if (!dailyStats[date]) {
      dailyStats[date] = {
        studyTime: 0,
        lessonsCompleted: 0,
        vocabularyWords: 0,
        pronunciationPractice: 0,
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
        dailyStats[date].studyTime += activity.duration || 0;
        break;
    }
  });

  // Generate labels based on time range
  const today = new Date();
  let daysToShow;

  switch (timeRange) {
    case "week":
      daysToShow = 7;
      break;
    case "month":
      daysToShow = 30;
      break;
    case "year":
      daysToShow = 365;
      break;
    default:
      daysToShow = 7;
  }

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    labels.push(dateString);
    studyTimeData.push(dailyStats[dateString]?.studyTime || 0);
    lessonsCompletedData.push(dailyStats[dateString]?.lessonsCompleted || 0);
    vocabularyData.push(dailyStats[dateString]?.vocabularyWords || 0);
    pronunciationData.push(dailyStats[dateString]?.pronunciationPractice || 0);
  }

  return {
    labels,
    datasets: [
      {
        label: "Study Time (minutes)",
        data: studyTimeData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      {
        label: "Lessons Completed",
        data: lessonsCompletedData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
      },
      {
        label: "Vocabulary Words",
        data: vocabularyData,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
      },
      {
        label: "Pronunciation Practice",
        data: pronunciationData,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
      },
    ],
  };
};

/**
 * Process vocabulary analytics data
 * @param {Array} progressData - Vocabulary progress data
 * @param {Array} activities - Vocabulary activities
 * @returns {Object} Processed vocabulary analytics
 */
const processVocabularyAnalytics = (progressData, activities) => {
  const totalWords = progressData.reduce(
    (sum, progress) => sum + (progress.totalWords || 0),
    0
  );
  const learnedWords = progressData.reduce(
    (sum, progress) => sum + (progress.learnedWords || 0),
    0
  );
  const accuracyRate =
    progressData.reduce(
      (sum, progress) => sum + (progress.accuracyRate || 0),
      0
    ) / Math.max(progressData.length, 1);

  const recentActivities = activities.slice(0, 10);
  const practiceSessions = activities.length;
  const newThisWeek = activities.filter((activity) => {
    const activityDate = activity.timestamp.toDate();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityDate >= weekAgo;
  }).length;

  return {
    totalWords,
    learnedWords,
    accuracyRate: Math.round(accuracyRate),
    practiceSessions,
    newThisWeek,
    progressPercentage:
      totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0,
    recentActivities,
  };
};

/**
 * Process pronunciation analytics data
 * @param {Array} progressData - Pronunciation progress data
 * @param {Array} activities - Pronunciation activities
 * @returns {Object} Processed pronunciation analytics
 */
const processPronunciationAnalytics = (progressData, activities) => {
  const averageAccuracy =
    progressData.reduce(
      (sum, progress) => sum + (progress.accuracyRate || 0),
      0
    ) / Math.max(progressData.length, 1);
  const wordsPracticed = activities.reduce(
    (sum, activity) => sum + (activity.wordsPracticed || 0),
    0
  );
  const perfectScores = activities.filter(
    (activity) => activity.accuracy === 100
  ).length;
  const practiceSessions = activities.length;

  const recentActivities = activities.slice(0, 10);

  return {
    averageAccuracy: Math.round(averageAccuracy),
    wordsPracticed,
    perfectScores,
    practiceSessions,
    recentActivities,
    progressPercentage: Math.round(
      (perfectScores / Math.max(practiceSessions, 1)) * 100
    ),
  };
};

/**
 * Get comprehensive analytics for dashboard
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Comprehensive analytics
 */
export const getDashboardAnalytics = async (userId) => {
  try {
    const [studyTrends, vocabularyAnalytics, pronunciationAnalytics] =
      await Promise.all([
        getStudyTrends(userId, "week"),
        getVocabularyAnalytics(userId),
        getPronunciationAnalytics(userId),
      ]);

    return {
      studyTrends,
      vocabularyAnalytics,
      pronunciationAnalytics,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    // Return default analytics instead of throwing error
    return {
      studyTrends: {
        studyTime: 0,
        lessonsCompleted: 0,
        vocabularyWords: 0,
        pronunciationPractice: 0,
        quizzesTaken: 0,
        averageAccuracy: 0,
        streakDays: 0,
        totalPoints: 0,
      },
      vocabularyAnalytics: {
        totalWords: 0,
        learnedWords: 0,
        accuracyRate: 0,
        practiceSessions: 0,
        newThisWeek: 0,
        progressPercentage: 0,
        recentActivities: [],
      },
      pronunciationAnalytics: {
        averageAccuracy: 0,
        wordsPracticed: 0,
        perfectScores: 0,
        practiceSessions: 0,
        recentActivities: [],
        progressPercentage: 0,
      },
    };
  }
};

/**
 * Get enhanced comprehensive analytics for dashboard
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Enhanced comprehensive analytics
 */
export const getEnhancedDashboardAnalytics = async (userId) => {
  try {
    const [studyTrends, vocabularyAnalytics, pronunciationAnalytics] =
      await Promise.all([
        getRealTimeStudyTrends(userId, "week"),
        getEnhancedVocabularyAnalytics(userId),
        getEnhancedPronunciationAnalytics(userId),
      ]);

    return {
      studyTrends,
      vocabularyAnalytics,
      pronunciationAnalytics,
    };
  } catch (error) {
    console.error("Error fetching enhanced dashboard analytics:", error);
    // Return default analytics instead of throwing error
    return {
      studyTrends: {
        studyTime: 0,
        lessonsCompleted: 0,
        vocabularyWords: 0,
        pronunciationPractice: 0,
        quizzesTaken: 0,
        averageAccuracy: 0,
        streakDays: 0,
        totalPoints: 0,
      },
      vocabularyAnalytics: {
        totalWords: 0,
        learnedWords: 0,
        accuracyRate: 0,
        practiceSessions: 0,
        newThisWeek: 0,
        newThisMonth: 0,
        averageSessionLength: 0,
        difficultyLevel: "beginner",
        retentionRate: 0,
        progressPercentage: 0,
        recentActivities: [],
        weeklyProgress: [],
        monthlyProgress: [],
      },
      pronunciationAnalytics: {
        averageAccuracy: 0,
        wordsPracticed: 0,
        perfectScores: 0,
        practiceSessions: 0,
        averageSessionLength: 0,
        difficultyLevel: "beginner",
        improvementRate: 0,
        accentAccuracy: 0,
        fluencyScore: 0,
        progressPercentage: 0,
        recentActivities: [],
        weeklyProgress: [],
        monthlyProgress: [],
      },
    };
  }
};

// Helper functions for enhanced analytics
const getStartDate = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case "day":
      return new Date(now.setHours(0, 0, 0, 0));
    case "week":
      return new Date(now.setDate(now.getDate() - 7));
    case "month":
      return new Date(now.setDate(now.getDate() - 30));
    case "year":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
};

const calculateAverageAccuracy = (activities) => {
  const accuracyActivities = activities.filter(
    (act) => act.accuracy !== undefined && act.accuracy !== null
  );
  if (accuracyActivities.length === 0) return 0;

  const totalAccuracy = accuracyActivities.reduce(
    (sum, act) => sum + act.accuracy,
    0
  );
  return Math.round(totalAccuracy / accuracyActivities.length);
};

const calculateStreakDays = (activities) => {
  // Implementation for calculating consecutive study days
  const sortedActivities = activities
    .filter(
      (act) =>
        act.type === "lesson_completed" || act.type === "vocabulary_practice"
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  if (sortedActivities.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    // Check up to 1 year
    const dayActivities = sortedActivities.filter((act) => {
      const actDate = new Date(act.timestamp);
      actDate.setHours(0, 0, 0, 0);
      return actDate.getTime() === currentDate.getTime();
    });

    if (dayActivities.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Vocabulary analytics helper functions
const calculateVocabularyAccuracy = (activities) => {
  const accuracyActivities = activities.filter(
    (act) => act.accuracy !== undefined
  );
  if (accuracyActivities.length === 0) return 0;

  const totalAccuracy = accuracyActivities.reduce(
    (sum, act) => sum + act.accuracy,
    0
  );
  return Math.round(totalAccuracy / accuracyActivities.length);
};

const calculateNewWordsThisWeek = (activities) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return activities.filter((act) => {
    return act.timestamp >= weekAgo && act.isNewWord === true;
  }).length;
};

const calculateNewWordsThisMonth = (activities) => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return activities.filter((act) => {
    return act.timestamp >= monthAgo && act.isNewWord === true;
  }).length;
};

const calculateAverageSessionLength = (activities) => {
  if (activities.length === 0) return 0;

  const totalDuration = activities.reduce(
    (sum, act) => sum + (act.duration || 0),
    0
  );
  return Math.round(totalDuration / activities.length);
};

const calculateDifficultyLevel = (activities) => {
  const difficultyCounts = {};
  activities.forEach((act) => {
    const level = act.difficultyLevel || "medium";
    difficultyCounts[level] = (difficultyCounts[level] || 0) + 1;
  });

  // Return the most common difficulty level
  return Object.keys(difficultyCounts).reduce((a, b) =>
    difficultyCounts[a] > difficultyCounts[b] ? a : b
  );
};

const calculateRetentionRate = (activities) => {
  const retentionActivities = activities.filter(
    (act) => act.retentionScore !== undefined
  );
  if (retentionActivities.length === 0) return 0;

  const totalRetention = retentionActivities.reduce(
    (sum, act) => sum + act.retentionScore,
    0
  );
  return Math.round(totalRetention / retentionActivities.length);
};

const calculateVocabularyProgress = (progressData) => {
  const totalWords = progressData.reduce(
    (sum, progress) => sum + (progress.totalWords || 0),
    0
  );
  const learnedWords = progressData.reduce(
    (sum, progress) => sum + (progress.learnedWords || 0),
    0
  );

  return totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
};

const calculateWeeklyVocabularyProgress = (activities) => {
  const weeklyData = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const dayActivities = activities.filter((act) => {
      const actDate = act.timestamp.toISOString().split("T")[0];
      return actDate === dateString;
    });

    weeklyData[dateString] = {
      wordsPracticed: dayActivities.reduce(
        (sum, act) => sum + (act.wordsPracticed || 0),
        0
      ),
      accuracy: calculateVocabularyAccuracy(dayActivities),
      sessions: dayActivities.length,
    };
  }

  return weeklyData;
};

const calculateMonthlyVocabularyProgress = (activities) => {
  const monthlyData = {};
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const dayActivities = activities.filter((act) => {
      const actDate = act.timestamp.toISOString().split("T")[0];
      return actDate === dateString;
    });

    monthlyData[dateString] = {
      wordsPracticed: dayActivities.reduce(
        (sum, act) => sum + (act.wordsPracticed || 0),
        0
      ),
      accuracy: calculateVocabularyAccuracy(dayActivities),
      sessions: dayActivities.length,
    };
  }

  return monthlyData;
};

// Pronunciation analytics helper functions
const calculatePronunciationAccuracy = (activities) => {
  const accuracyActivities = activities.filter(
    (act) => act.accuracy !== undefined
  );
  if (accuracyActivities.length === 0) return 0;

  const totalAccuracy = accuracyActivities.reduce(
    (sum, act) => sum + act.accuracy,
    0
  );
  return Math.round(totalAccuracy / accuracyActivities.length);
};

const calculateAveragePronunciationSessionLength = (activities) => {
  if (activities.length === 0) return 0;

  const totalDuration = activities.reduce(
    (sum, act) => sum + (act.duration || 0),
    0
  );
  return Math.round(totalDuration / activities.length);
};

const calculatePronunciationDifficultyLevel = (activities) => {
  const difficultyCounts = {};
  activities.forEach((act) => {
    const level = act.difficultyLevel || "medium";
    difficultyCounts[level] = (difficultyCounts[level] || 0) + 1;
  });

  return Object.keys(difficultyCounts).reduce((a, b) =>
    difficultyCounts[a] > difficultyCounts[b] ? a : b
  );
};

const calculatePronunciationImprovementRate = (activities) => {
  // Calculate improvement over time
  const sortedActivities = activities.sort((a, b) => a.timestamp - b.timestamp);
  if (sortedActivities.length < 2) return 0;

  const recentActivities = sortedActivities.slice(-10);
  const olderActivities = sortedActivities.slice(0, 10);

  const recentAverage = calculatePronunciationAccuracy(recentActivities);
  const olderAverage = calculatePronunciationAccuracy(olderActivities);

  return Math.round(recentAverage - olderAverage);
};

const calculateAccentAccuracy = (activities) => {
  const accentActivities = activities.filter(
    (act) => act.accentAccuracy !== undefined
  );
  if (accentActivities.length === 0) return 0;

  const totalAccentAccuracy = accentActivities.reduce(
    (sum, act) => sum + act.accentAccuracy,
    0
  );
  return Math.round(totalAccentAccuracy / accentActivities.length);
};

const calculateFluencyScore = (activities) => {
  const fluencyActivities = activities.filter(
    (act) => act.fluencyScore !== undefined
  );
  if (fluencyActivities.length === 0) return 0;

  const totalFluency = fluencyActivities.reduce(
    (sum, act) => sum + act.fluencyScore,
    0
  );
  return Math.round(totalFluency / fluencyActivities.length);
};

const calculatePronunciationProgress = (activities) => {
  const perfectScores = activities.filter((act) => act.accuracy === 100).length;
  const totalSessions = activities.length;

  return totalSessions > 0
    ? Math.round((perfectScores / totalSessions) * 100)
    : 0;
};

const calculateWeeklyPronunciationProgress = (activities) => {
  const weeklyData = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const dayActivities = activities.filter((act) => {
      const actDate = act.timestamp.toISOString().split("T")[0];
      return actDate === dateString;
    });

    weeklyData[dateString] = {
      wordsPracticed: dayActivities.reduce(
        (sum, act) => sum + (act.wordsPracticed || 0),
        0
      ),
      accuracy: calculatePronunciationAccuracy(dayActivities),
      sessions: dayActivities.length,
      perfectScores: dayActivities.filter((act) => act.accuracy === 100).length,
    };
  }

  return weeklyData;
};

const calculateMonthlyPronunciationProgress = (activities) => {
  const monthlyData = {};
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const dayActivities = activities.filter((act) => {
      const actDate = act.timestamp.toISOString().split("T")[0];
      return actDate === dateString;
    });

    monthlyData[dateString] = {
      wordsPracticed: dayActivities.reduce(
        (sum, act) => sum + (act.wordsPracticed || 0),
        0
      ),
      accuracy: calculatePronunciationAccuracy(dayActivities),
      sessions: dayActivities.length,
      perfectScores: dayActivities.filter((act) => act.accuracy === 100).length,
    };
  }

  return monthlyData;
};

export default {
  getStudyTrends,
  getRealTimeStudyTrends,
  getVocabularyAnalytics,
  getEnhancedVocabularyAnalytics,
  getPronunciationAnalytics,
  getEnhancedPronunciationAnalytics,
  getDashboardAnalytics,
  getEnhancedDashboardAnalytics,
};
